// src/lib/tsyringeTsoaIocContainer.ts
// Target this file in your tsoa.json's "iocModule" property

import { IocContainer, ServiceIdentifier } from '@tsoa/runtime';
import { container } from 'tsyringe';

export const iocContainer: IocContainer = {
  get: <T>(controller: ServiceIdentifier<T>): T => {
    return container.resolve<T>(controller as never);
  },
};
