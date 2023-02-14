import {sortMultisigActions} from 'utils/library';
import {Action, ActionWithdraw} from 'utils/types';

const removeAddress = (count = 1) => {
  const obj = {
    inputs: {
      memberWallets: [
        {
          address: '0x0f054c3d99c000d3c0b718eabee834870f408dd0',
        },
      ],
    },
    name: 'remove_address',
  };

  const memberWallets = [];

  for (let index = 0; index < count; index++) {
    memberWallets.push({
      address: '0x0f054c3d99c000d3c0b718eabee834870f408dd0',
    });
  }

  obj.inputs.memberWallets = memberWallets;

  return obj;
};

const addAddress = {
  inputs: {
    memberWallets: [{address: '0xfCb24EcB272a791dd699bFbAAFD2af69DF88AF9D'}],
  },
  name: 'add_address',
};
const minApprovals = {
  inputs: {minimumApproval: '1'},
  name: 'update_minimum_approval',
};
const withdraw: ActionWithdraw = {
  to: '0xfCb24EcB272a791dd699bFbAAFD2af69DF88AF9D',
  tokenSymbol: 'ETH',
  amount: 0.00005,
  name: 'withdraw_assets',
  isCustomToken: false,
  tokenName: 'Goerli Ether',
  tokenImgUrl:
    'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
  tokenAddress: '0x0000000000000000000000000000000000000000',
  tokenBalance: 0.001,
  tokenPrice: 1515.98,
};

const testCases = [
  {
    case: 'should move `add_address` to the top',
    previousMembersLength: 6,
    previousApprovals: 2,
    passedActions: [withdraw, withdraw, addAddress],
    sortedActions: [addAddress, withdraw, withdraw],
  },
  {
    case: 'should move `remove_address` to the top',
    previousMembersLength: 6,
    previousApprovals: 2,
    passedActions: [withdraw, withdraw, removeAddress()],
    sortedActions: [removeAddress(), withdraw, withdraw],
  },
  {
    case: 'should move `remove_address` up but not above `add_address`',
    previousMembersLength: 6,
    previousApprovals: 2,
    passedActions: [withdraw, addAddress, withdraw, removeAddress()],
    sortedActions: [addAddress, removeAddress(), withdraw, withdraw],
  },
  {
    case: 'should not move `update_minimum_approval` above `remove_address` if condition not met',
    previousMembersLength: 3,
    previousApprovals: 2,
    passedActions: [removeAddress(), addAddress, minApprovals],
    sortedActions: [addAddress, removeAddress(), minApprovals],
  },
  {
    case: 'should move `update_minimum_approval` above `remove_address` if condition met',
    previousMembersLength: 3,
    previousApprovals: 2,
    passedActions: [removeAddress(3), addAddress, minApprovals],
    sortedActions: [addAddress, minApprovals, removeAddress(3)],
  },
];

describe("Utility function 'sortMultisigActions'", () => {
  testCases.forEach(tc => {
    test(tc.case, () => {
      const sorted = sortMultisigActions(
        tc.passedActions as Array<Action>,
        tc.previousMembersLength,
        tc.previousApprovals
      );

      expect(sorted).toStrictEqual(tc.sortedActions);
    });
  });
});
