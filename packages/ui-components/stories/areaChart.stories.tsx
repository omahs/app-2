import React from 'react';
import {Meta, Story} from '@storybook/react';
import {AreaChart} from '../src';

export default {
  title: 'Components/charts/Area',
  component: AreaChart,
} as Meta;

const Template: Story = args => <AreaChart {...args} />;

export const Area = Template.bind({});