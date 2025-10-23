import { Module } from '@nestjs/common';

import { NinetwoORMModule } from 'src/engine/ninetwo-orm/ninetwo-orm.module';
import { FavoriteFolderDeletionListener } from 'src/modules/favorite-folder/listeners/favorite-folder.listener';

@Module({
  imports: [NinetwoORMModule],
  providers: [FavoriteFolderDeletionListener],
})
export class FavoriteFolderModule {}
