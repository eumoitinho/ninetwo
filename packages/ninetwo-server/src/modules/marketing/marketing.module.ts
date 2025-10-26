import { Module } from '@nestjs/common';

import { MarketingCommonModule } from 'src/modules/marketing/common/marketing-common.module';
import { MarketingAccountsManagerModule } from 'src/modules/marketing/marketing-accounts-manager/marketing-accounts-manager.module';
import { MarketingApisManagerModule } from 'src/modules/marketing/marketing-apis-manager/marketing-apis-manager.module';
import { MarketingImportManagerModule } from 'src/modules/marketing/marketing-import-manager/marketing-import-manager.module';
import { MarketingRealtimeManagerModule } from 'src/modules/marketing/marketing-realtime-manager/marketing-realtime-manager.module';

@Module({
  imports: [
    MarketingCommonModule, // Entities compartilhadas
    MarketingAccountsManagerModule, // Gerenciamento de contas
    MarketingApisManagerModule, // APIs gerais
    MarketingImportManagerModule, // Background sync
    MarketingRealtimeManagerModule, // Operações em tempo real
  ],
  providers: [], // ✅ VAZIO - lógica nos submódulos
  exports: [], // ✅ VAZIO - submódulos exportam o que precisam
})
export class MarketingModule {}
