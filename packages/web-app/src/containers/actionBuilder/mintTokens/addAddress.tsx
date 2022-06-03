import React, {useEffect} from 'react';
import styled from 'styled-components';
import {ButtonText} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {useFormContext, useFieldArray, useWatch} from 'react-hook-form';

import Row from 'components/addWallets/row';
import Header from 'components/addWallets/header';
import Footer from 'components/addWallets/footer';

type AddAddressProps = {
  index?: number;
  setActionsCounter?: (index: number) => void;
};

const AddAddress: React.FC<AddAddressProps> = ({
  index = 0,
  setActionsCounter,
}) => {
  const {t} = useTranslation();

  const {control, setValue, trigger} = useFormContext();
  const wallets = useWatch({
    name: `actions.${index}.wallets`,
    control: control,
  });
  const {fields, append, remove} = useFieldArray({
    name: 'wallets',
    control,
  });

  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...(wallets && {...wallets[index]}),
    };
  });

  useEffect(() => {
    append({address: '', amount: '0'});
  }, []);

  // setTimeout added because instant trigger not working
  const handleAddWallet = () => {
    append({address: '', amount: '0'});
    setTimeout(() => {
      trigger(`actions.${index}.wallets.${controlledFields.length}.address`);
    }, 50);
  };

  return (
    <Container data-testid="add-wallets">
      <ListGroup>
        <Header bgWhite />
        {controlledFields.map((field, index) => {
          return (
            <Row
              key={field.id}
              index={index}
              bgWhite
              // Replace when minting to treasury is supported
              // {...(index !== 0 ? {onDelete: () => remove(index)} : {})}
              onDelete={() => remove(index)}
            />
          );
        })}
        <Footer totalAddresses={fields.length || 0} bgWhite />
      </ListGroup>
      <ActionsWrapper>
        <ButtonText
          label={t('labels.whitelistWallets.addAddress') as string}
          mode="ghost"
          size="large"
          onClick={handleAddWallet}
        />
        <ButtonText
          label={t('labels.whitelistWallets.uploadCSV') as string}
          mode="secondary"
          size="large"
          onClick={handleAddWallet}
        />
      </ActionsWrapper>
    </Container>
  );
};

export default AddAddress;

const Container = styled.div.attrs({className: 'space-y-1.5'})``;

const ListGroup = styled.div.attrs({
  className: 'flex flex-col overflow-hidden space-y-0.25 rounded-xl',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'flex space-x-2',
})``;
