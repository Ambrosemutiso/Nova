import dynamic from 'next/dynamic';

const CartPage = dynamic(() => import('@/components/CartPage'), {
  ssr: false,
});

export default function Page() {
  return <CartPage />;
}
