'use client';

import CategorySection from '@/components/categorySection';
import Electronics from '@/components/categories/Electronics/page';
import Fashion from '@/components/categories/Fashion/page';
import Phones from '@/components/categories/Phones/page';
import Computers from '@/components/categories/Computers/page';
import Laptops from '@/components/categories/Laptops/page';
import Motors from '@/components/categories/Motors/page';
import Books from '@/components/categories/Books/page';
import Sofas from '@/components/categories/Sofas/page';
import Household from '@/components/categories/Household/page';
import Kids from '@/components/categories/Kids/page';
import Machines from '@/components/categories/Machines/page';
import Women from '@/components/categories/Women/page';
import Men from '@/components/categories/Men/page';
import Skincare from '@/components/categories/Skincare/page';
import Health from '@/components/categories/Health/page';
import Spares from '@/components/categories/Spares/page';
import Beauty from '@/components/categories/Beauty/page';
import Kitchen from '@/components/categories/Kitchen/page';
import Liquor from '@/components/categories/Liquor/page';
import Sports from '@/components/categories/Sports/page';
import Robotics from '@/components/categories/Robotics/page';
import Systems from '@/components/categories/Sound/page';
import Gaming from '@/components/categories/Gaming/page';

interface ProductsListProps {
  category: string;
}

export default function ProductsList({ category }: ProductsListProps) {
const renderCategory = (title: string, Component: React.FC) => (
  <CategorySection title={title} categorySlug={title.toLowerCase()}>
    <Component />
  </CategorySection>
);

  switch (category) {
    case 'Electronics':
      return renderCategory('Electronics', Electronics);
    case 'Sound Systems':
      return renderCategory('Sound Systems', Systems);
    case 'Fashion':
      return renderCategory('Fashion', Fashion);
    case 'Phones&Tablets':
      return renderCategory('Phones & Tablets', Phones);
    case 'Laptops':
      return renderCategory('Laptops', Laptops);
    case 'Computers':
      return renderCategory('Computers', Computers);
    case 'Household':
      return renderCategory('Household', Household);
    case 'Kitchen':
      return renderCategory('Kitchen', Kitchen);
    case 'Sofas':
      return renderCategory('Sofas', Sofas);
    case 'Health':
      return renderCategory('Health', Health);
    case 'Beauty':
      return renderCategory('Beauty', Beauty);
    case 'Women':
      return renderCategory('Women', Women);
    case 'Kids':
      return renderCategory('Kids', Kids);
      case 'Gaming':
      return renderCategory('Gaming', Gaming);
    case 'Skincare':
      return renderCategory('Skincare', Skincare);
    case 'Men':
      return renderCategory('Men', Men);
    case 'Books':
      return renderCategory('Books', Books);
    case 'Machines':
      return renderCategory('Machines', Machines);
    case 'Spares':
      return renderCategory('Spares', Spares);
    case 'Motors':
      return renderCategory('Motors', Motors);
    case 'Liquor':
      return renderCategory('Liquor', Liquor);
          case 'Sports':
      return renderCategory('Sports', Sports);
          case 'Robotics':
      return renderCategory('Robotics', Robotics);
    default:
      return (
        <>
          {renderCategory('Electronics', Electronics)}
          {renderCategory('Phones&Tablets', Phones)}
          {renderCategory('Sound Systems', Systems)}
          {renderCategory('Fashion', Fashion)}
          {renderCategory('Laptops', Laptops)}
          {renderCategory('Computers', Computers)}
          {renderCategory('Household', Household)}
          {renderCategory('Kitchen', Kitchen)}
          {renderCategory('Sofas', Sofas)}
          {renderCategory('Health', Health)}
          {renderCategory('Beauty', Beauty)}
          {renderCategory('Women', Women)}
          {renderCategory('Kids', Kids)}
          {renderCategory('Gaming', Gaming)}
          {renderCategory('Skincare', Skincare)}
          {renderCategory('Men', Men)}
          {renderCategory('Books', Books)}
          {renderCategory('Machines', Machines)}
          {renderCategory('Spares', Spares)}
          {renderCategory('Motors', Motors)}
          {renderCategory('Liquor', Liquor)}
          {renderCategory('Sports', Sports)}
          {renderCategory('Robotics', Robotics)}
        </>
      );
  }
}
