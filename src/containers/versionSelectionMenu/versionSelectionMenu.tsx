import {ButtonText} from '@aragon/ods';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {UpdateListItem} from 'containers/updateListItem/updateListItem';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

export type CheckboxListItemProps = {
  isOpen: boolean;
  handleCloseMenu: () => void;
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
      <div className="grid gap-y-3 py-3 px-2">
        <VersionListContainer>
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
        </VersionListContainer>
        <ActionContainer>
          <ButtonText
            label={t('update.modalVersion.ctaLabel')}
            mode="primary"
            size="large"
            onClick={() => null}
          />
        </ActionContainer>
      </div>
    </ModalBottomSheetSwitcher>
  );
};

const VersionListContainer = styled.div.attrs({
  className: 'grid gap-y-1.5',
})``;

const ActionContainer = styled.div.attrs({
  className: 'grid gap-y-1.5',
})``;
