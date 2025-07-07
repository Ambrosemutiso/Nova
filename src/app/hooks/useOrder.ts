// /app/hooks/useOrder.ts
export function useOrders(page: number, sort: string, order: string, userId: string | null, statusFilter: string) {
  const fetcher = (url: string) => axios.get(url).then(res => res.data);

  const shouldFetch = !!userId;

  const { data, error } = useSWR(
    shouldFetch
      ? `/api/orders?userId=${userId}&page=${page}&sort=${sort}&order=${order}&status=${statusFilter}`
      : null,
    fetcher
  );

  return {
    orders: data?.orders || [],
    totalPages: data?.totalPages || 1,
    loading: !data && !error,
    error,
  };
}
