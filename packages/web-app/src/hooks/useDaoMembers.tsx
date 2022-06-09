const MOCK_ADDRESSES = [
  '0x8367dc645e31321CeF3EeD91a10a5b7077e21f70',
  'cool.eth',
];

export function useDaoMembers(dao: string) {
  //TODO: eventually, this will need to be queried from subgraph.
  // const {data, error, loading} = useQuery(APPROPRIATE_QUERY, {
  //   variables: {id: dao},
  //   client: client[network],
  //   fetchPolicy: 'no-cache',
  // });

  return {data: MOCK_ADDRESSES, error: null, loading: false};
}
