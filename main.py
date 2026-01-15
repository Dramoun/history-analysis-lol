import time
from datetime import datetime
import json
import requests

API_KEY="RGAPI-d6c6a388-14dc-4d87-a105-71573de9cd60"
USER_TAG="EUNE"
USERNAME="TechnoRave"

MATCH_COUNT=200

ROUTING_REGION="europe"
BASE_URL = f"https://{ROUTING_REGION}.api.riotgames.com"

USERNAME_VAR="riotIdGameName"
USERTAG_VAR="riotIdTagLine"
WIN_VAR="win"
TEAM_VAR="team_id"

# match_data['info']['queueId']
SOLO_Q="420"
FLEX_Q="440"


DEFAULT_REQ_TIMEOUT=10
TOTAL_CALLS=0

def get_player_champ(player_list, player_name_duo):
  return player_data_lookup(players_list, player_name_duo, 'champion')

def get_player_team(player_list, player_name_duo):
  return player_data_lookup(players_list, player_name_duo, 'team')

def get_player_outcome(player_list, player_name_duo):
  return player_data_lookup(players_list, player_name_duo, 'outcome')

def player_data_lookup(players_list, player_name_duo, data_key):
  for player in players_list:
    player_combo_name = player.get('name') + player.get('tag')

    if player_combo_name == player_name_duo:
      return player.get(data_key)

  return None       

def player_info(game_data):
  player_data = {
    "name": game_data.get('riotIdGameName'),
    "tag": game_data.get('riotIdTagline'),
    "outcome": game_data.get('win'),
    "team": game_data.get('teamId'),
    "champion": game_data.get('championName')
  }
  return player_data

def filter_match_data(match_data):
  all_players = []

  for participant in match_data['info']['participants']:
    all_players.append(player_info(participant))

  return all_players

def get(path, params=None):
  global TOTAL_CALLS
  
  url = f"{BASE_URL}{path}"
  headers = {"X-Riot-Token": API_KEY}

  while True:
    res = requests.get(url, headers=headers, params=params, timeout=DEFAULT_REQ_TIMEOUT)
    TOTAL_CALLS += 1

    if res.status_code == 429:
      retry = int(res.headers.get('Retry-After', '1'))
      print(f'Status code 429 recieved: sleeping for {retry}s')
      print(f'Total calls so far: {TOTAL_CALLS}')
      time.sleep(retry)
      continue

    res.raise_for_status()

    return res.json()

def get_puuid(username, usertag):
  path = f"/riot/account/v1/accounts/by-riot-id/{username}/{usertag}"
  res = get(path)

  return res['puuid']

def get_match_ids(puuid, total, start=0):
  all_matches = []
  if total > 100:
    count = 100
  else:
    count = total
        
  while len(all_matches) < total:
    path= f"/lol/match/v5/matches/by-puuid/{puuid}/ids"
    params = {
      "start": start,
      "count": count,
      "type": "ranked"
    }
    res = get(path, params=params)

    if not res:
        break
        
    all_matches.extend(res)
    start += count

    if len(all_matches) == total:
        break
        
  return all_matches

def get_match_data(match_id):
  path = f"/lol/match/v5/matches/{match_id}"
  res = get(path)
  #start = res["info"]["gameStartTimestamp"]
  #start_dt = datetime.fromtimestamp(start / 1000)
  #print("Match date: ", start_dt)

  return res

def get_duo_data(username, usertag, history_len):
  solo_win_ration = 0
  duo_win_ration = []

  puuid = get_puuid(username, usertag)
  match_ids = get_match_ids(puuid, history_len)
  print('Total match ids: ', len(match_ids))

  matches_data = []

  total_player_data = {}
    
  for _id in match_ids:
    matches_data.append(get_match_data(_id))

  for match in matches_data:
    player_team = 0
    players = []
        
    for party in match.get("info").get("participants"):
        pi = player_info(party)
        players.append(pi)

        if pi.get('name') + pi.get('tag') == USERNAME + USER_TAG:
            player_team = pi.get('team')
           
    team_players = list(filter(lambda player: player.get('team') == player_team, players))

    for player in team_players:
      player_tag = player.get('name') + player.get('tag')
      outcome = 1 if player.get('outcome') else 0
      
      if player_tag not in total_player_data:
        total_player_data[player_tag] = [outcome,1]
      else:
        specific_play_data = total_player_data[player_tag]
        specific_play_data[0] += outcome
        specific_play_data[1] += 1
    
  return total_player_data

def filter_player_by_team(team, player_data):
  return player_data['team'] == team

def main():
  duo_data = get_duo_data(USERNAME,USER_TAG, MATCH_COUNT)
  for player, data in duo_data.items():
    if data[1] >= 10:
      print("------------")
      print(player, data)
    
if __name__ == "__main__":
  main()

