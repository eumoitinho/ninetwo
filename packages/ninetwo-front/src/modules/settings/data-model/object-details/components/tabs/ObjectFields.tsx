import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SettingsPath } from 'ninetwo-shared/types';
import { getSettingsPath } from 'ninetwo-shared/utils';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconPlus } from 'ninetwo-ui/display';
import { Button } from 'ninetwo-ui/input';
import { Section } from 'ninetwo-ui/layout';
import { UndecoratedLink } from 'ninetwo-ui/navigation';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type ObjectFieldsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const ObjectFields = ({ objectMetadataItem }: ObjectFieldsProps) => {
  const readonly = isObjectMetadataReadOnly({
    objectMetadataItem,
  });

  const { t } = useLingui();
  const objectLabelSingular = objectMetadataItem.labelSingular;

  return (
    <Section>
      <H2Title
        title={t`Fields`}
        description={t`Customise the fields available in the ${objectLabelSingular} views.`}
      />
      <SettingsObjectFieldTable
        objectMetadataItem={objectMetadataItem}
        mode="view"
      />
      {!readonly && (
        <StyledDiv>
          <UndecoratedLink
            to={getSettingsPath(SettingsPath.ObjectNewFieldSelect, {
              objectNamePlural: objectMetadataItem.namePlural,
            })}
          >
            <Button
              Icon={IconPlus}
              title={t`Add Field`}
              size="small"
              variant="secondary"
            />
          </UndecoratedLink>
        </StyledDiv>
      )}
    </Section>
  );
};
