import { Module } from '@nestjs/common';

import { NinetwoConfigModule } from 'src/engine/core-modules/ninetwo-config/ninetwo-config.module';
import { CalDavClientProvider } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/providers/caldav.provider';
import { CalDavGetEventsService } from 'src/modules/calendar/calendar-event-import-manager/drivers/caldav/services/caldav-get-events.service';

@Module({
  imports: [NinetwoConfigModule],
  providers: [CalDavClientProvider, CalDavGetEventsService],
  exports: [CalDavGetEventsService],
})
export class CalDavDriverModule {}
