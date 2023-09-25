import {
  ButtonText,
  IconCheckboxDefault,
  IconCheckboxSelected,
  IconLinkExternal,
  Link,
  Tag,
} from '@aragon/ods';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {UpdateListItem} from 'containers/updateListItem/updateListItem';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

export const Icons = {
  active: <IconCheckboxSelected />,
  default: <IconCheckboxDefault />,
  error: <IconCheckboxDefault />,
};

export type CheckboxListItemProps = {
  isOpen: boolean;
  handleCloseMenu: () => null;
};

// TODO: This might be a component that
export const VersionSelectionMenu: React.FC<CheckboxListItemProps> = ({
  isOpen,
  handleCloseMenu,
}) => {
  const {t} = useTranslation();

  return (
    <ModalBottomSheetSwitcher
      onClose={handleCloseMenu}
      isOpen={isOpen}
      title={t('update.modalVersion.title')}
      subtitle={t('update.modalVersion.desc')}
    >
      <div className="py-3 px-2">
        <UpdateListItem
          label={'Token voting v1.12'}
          LinkLabel={'View release notes'}
          tagLabelNatural="Latest"
          tagLabelInfo="Prepared"
        />
        <UpdateListItem
          label={'Token voting v1.12'}
          LinkLabel={'View release notes'}
        />
      </div>
    </ModalBottomSheetSwitcher>
  );
};
