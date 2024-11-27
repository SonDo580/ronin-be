import { DataSource } from 'typeorm';
import { dataSource } from './data-source';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (): Promise<DataSource> => {
      return dataSource.initialize();
    },
  },
];
