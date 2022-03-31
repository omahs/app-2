import React from 'react';
import {Meta, Story} from '@storybook/react';
import {AlertCard, AlertCardProps} from '../src';

export default {
  title: 'Components/Alerts/Card',
  component: AlertCard,
} as Meta;

const Template: Story<AlertCardProps> = args => <AlertCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  mode: 'info',
  label: 'Testnet Active',
};
