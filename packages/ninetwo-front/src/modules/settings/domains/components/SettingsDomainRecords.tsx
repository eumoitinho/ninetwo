import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsDnsRecordsTable } from '@/settings/components/SettingsDnsRecordsTable';
import { useRecoilValue } from 'recoil';
import { H2Title } from 'ninetwo-ui/display';
import { Section } from 'ninetwo-ui/layout';
import { type ThemeColor } from 'ninetwo-ui/theme';
import {
  type DomainRecord,
  type DomainValidRecords,
} from '~/generated/graphql';

export const SettingsDomainRecords = ({
  records,
}: {
  records: DomainValidRecords['records'];
}) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const rowsDefinitions = [
    { name: 'Domain Setup', validationType: 'redirection' as const },
    { name: 'Secure Connection', validationType: 'ssl' as const },
  ];

  const defaultValues: { status: string; statusColor: ThemeColor } =
    currentWorkspace?.customDomain
      ? {
          status: 'success',
          statusColor: 'green',
        }
      : {
          status: 'loading',
          statusColor: 'gray',
        };

  const transformedRecords = rowsDefinitions.map<
    { statusColor: ThemeColor } & DomainRecord
  >((row) => {
    const record = records.find(
      ({ validationType }) => validationType === row.validationType,
    );

    if (!record) {
      throw new Error(`Record ${row.name} not found`);
    }

    return {
      statusColor:
        record && record.status === 'error'
          ? 'red'
          : record && record.status === 'pending'
            ? 'yellow'
            : defaultValues.statusColor,
      ...record,
    };
  });

  return (
    <Section>
      <H2Title
        title="Domain Setup"
        description="Configure these DNS records with your domain provider"
      />
      <SettingsDnsRecordsTable records={transformedRecords} />
    </Section>
  );
};
