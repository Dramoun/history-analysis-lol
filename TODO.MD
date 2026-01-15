storage ideas:
1. db for smaller file data connected with ids to larger files saved into jsons

big files like match data:
  get > zstd compress > save > load > decopress zstd > work with
   saving such as
    matches/yyyy/mm/dd/match_ids.json.zst


postgressql for db
https://dev.to/yugjadvani/advanced-integration-connecting-postgresql-with-nodejs-in-a-typescript-ecosystem-3nnh
