'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Product = {
  _id?: string;
  name?: string;
  images?: string[];
  calculatedPrice?: number;
};

type Banner = {
  id: number;
  src: string;
  alt: string;
  link: string;
  heading?: string;
  cta?: string;
  products?: Product[];
};

const CARD_INTERVAL = 3000;
const TRANSITION_DURATION = 700;

export default function HeroSlider() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  const [productIndex, setProductIndex] = useState(0);

  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [dragStart, setDragStart] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);

  const [isChangingCategory, setIsChangingCategory] =
    useState(false);

  const [imageLoaded, setImageLoaded] =
    useState<Record<number, boolean>>({});

  const containerRef =
    useRef<HTMLDivElement>(null);

  const productTimerRef =
    useRef<NodeJS.Timeout | null>(null);

  const categoryTimerRef =
    useRef<NodeJS.Timeout | null>(null);

  /*
  |--------------------------------------------------------------------------
  | FETCH BANNERS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/products/featured');

        if (!res.ok) {
          throw new Error('Failed to fetch banners');
        }

        const data = await res.json();

        setBanners(data);
      } catch (error) {
        console.error(
          'Banner fetch error:',
          error
        );
      }
    };

    fetchBanners();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CURRENT PRODUCTS
  |--------------------------------------------------------------------------
  */

  const activeBanner = banners[current];

  const products =
    activeBanner?.products?.slice(0, 3) ?? [];

  const activeProduct =
    products[productIndex] ?? null;

  /*
  |--------------------------------------------------------------------------
  | CHANGE CATEGORY
  |--------------------------------------------------------------------------
  */

  const changeCategory = useCallback(
    (direction: 1 | -1) => {
      if (!banners.length) return;

      setIsChangingCategory(true);

      setTimeout(() => {
        setCurrent((prev) => {
          return (
            (prev + direction + banners.length) %
            banners.length
          );
        });

        setProductIndex(0);

        setTimeout(() => {
          setIsChangingCategory(false);
        }, 100);
      }, TRANSITION_DURATION);
    },
    [banners.length]
  );

  /*
  |--------------------------------------------------------------------------
  | NEXT CATEGORY
  |--------------------------------------------------------------------------
  */

  const next = useCallback(() => {
    changeCategory(1);
  }, [changeCategory]);

  /*
  |--------------------------------------------------------------------------
  | PREVIOUS CATEGORY
  |--------------------------------------------------------------------------
  */

  const prev = useCallback(() => {
    changeCategory(-1);
  }, [changeCategory]);

  /*
  |--------------------------------------------------------------------------
  | PRODUCT ROTATION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !activeBanner ||
      products.length <= 1 ||
      isHovered ||
      isDragging ||
      isChangingCategory
    ) {
      return;
    }

    productTimerRef.current =
      setTimeout(() => {
        if (productIndex < products.length - 1) {
          setProductIndex((prev) => prev + 1);
        } else {
          next();
        }
      }, CARD_INTERVAL);

    return () => {
      if (productTimerRef.current) {
        clearTimeout(productTimerRef.current);
      }
    };
  }, [
    activeBanner,
    productIndex,
    products.length,
    isHovered,
    isDragging,
    isChangingCategory,
    next,
  ]);

  /*
  |--------------------------------------------------------------------------
  | DRAG START
  |--------------------------------------------------------------------------
  */

  const handleDragStart = (
    clientX: number
  ) => {
    setIsDragging(true);
    setDragStart(clientX);
    setDragDelta(0);
  };

  /*
  |--------------------------------------------------------------------------
  | DRAG MOVE
  |--------------------------------------------------------------------------
  */

  const handleDragMove = (
    clientX: number
  ) => {
    if (!isDragging) return;

    setDragDelta(
      clientX - dragStart
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DRAG END
  |--------------------------------------------------------------------------
  */

  const handleDragEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    const threshold = 60;

    if (dragDelta < -threshold) {
      next();
    } else if (dragDelta > threshold) {
      prev();
    }

    setDragDelta(0);
  };

  /*
  |--------------------------------------------------------------------------
  | MOUSE
  |--------------------------------------------------------------------------
  */

  const onMouseDown = (
    e: React.MouseEvent
  ) => {
    handleDragStart(e.clientX);
  };

  const onMouseMove = (
    e: React.MouseEvent
  ) => {
    handleDragMove(e.clientX);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  const onMouseLeave = () => {
    handleDragEnd();
    setIsHovered(false);
  };

  /*
  |--------------------------------------------------------------------------
  | TOUCH
  |--------------------------------------------------------------------------
  */

  const onTouchStart = (
    e: React.TouchEvent
  ) => {
    handleDragStart(
      e.touches[0].clientX
    );
  };

  const onTouchMove = (
    e: React.TouchEvent
  ) => {
    handleDragMove(
      e.touches[0].clientX
    );
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (!banners.length) {
    return (
      <div
        className="
          w-full
          h-[300px]
          sm:h-[360px]
          md:h-[430px]
          lg:h-[500px]
          rounded-3xl
          bg-gradient-to-br
          from-orange-50
          via-orange-100
          to-neutral-200
          animate-pulse
        "
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PODIUM THEME
  |--------------------------------------------------------------------------
  */

  const podiumGradient =
    'linear-gradient(180deg, #ff8a32 0%, #f97316 48%, #c2410c 100%)';

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative w-full select-none">

      {/* ============================================================
          MAIN HERO
      ============================================================ */}

      <div
        ref={containerRef}
        className="
          relative
          w-full
          overflow-hidden
          rounded-3xl
          shadow-2xl
          cursor-grab
          active:cursor-grabbing

          h-[300px]
          sm:h-[360px]
          md:h-[430px]
          lg:h-[500px]

          bg-neutral-950
        "
        onMouseEnter={() =>
          setIsHovered(true)
        }
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        {/* ========================================================
            BACKGROUND SCENE
        ======================================================== */}

        <AnimatePresence mode="sync">

          <motion.div
            key={activeBanner.id}
            className="absolute inset-0"
            initial={{
              opacity: 0,
              scale: 1.06,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 1.03,
            }}
            transition={{
              duration: 0.7,
              ease: 'easeInOut',
            }}
          >

            <Image
              src={activeBanner.src}
              alt=""
              fill
              priority
              sizes="100vw"
              className="
                object-cover
                pointer-events-none
              "
            />

            {/* Dark cinematic overlay */}

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-r
                from-black/45
                via-black/10
                to-black/10
              "
            />

            {/* Orange ambient glow */}

            <motion.div
              className="
                absolute
                right-[10%]
                top-[10%]
                w-[45%]
                aspect-square
                rounded-full
                bg-orange-500/30
                blur-[80px]
              "
              animate={{
                scale: [1, 1.08, 1],
                opacity: [
                  0.45,
                  0.65,
                  0.45,
                ],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

          </motion.div>

        </AnimatePresence>


        {/* ========================================================
            CATEGORY LABEL
        ======================================================== */}

        <motion.div
          key={`label-${activeBanner.id}`}
          initial={{
            opacity: 0,
            x: -25,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            absolute
            left-5
            bottom-7
            sm:left-7
            sm:bottom-8
            md:left-10
            md:bottom-10
            z-30
          "
        >

          <div
            className="
              text-[10px]
              sm:text-xs
              font-bold
              tracking-[0.25em]
              uppercase
              text-orange-300
              mb-1
            "
          >
            NEW
          </div>

          <Link
            href={activeBanner.link}
            className="
              group
              flex
              items-center
              gap-2
            "
          >

            <span
              className="
                text-2xl
                sm:text-3xl
                md:text-4xl
                font-bold
                text-white
                drop-shadow-xl
              "
            >
              {activeBanner.heading}
            </span>

            <ArrowRight
              className="
                w-5
                h-5
                sm:w-6
                sm:h-6
                text-white
                transition-transform
                group-hover:translate-x-1
              "
            />

          </Link>

        </motion.div>


        {/* ========================================================
            PRODUCT SHOWROOM
        ======================================================== */}

        <AnimatePresence mode="wait">

          {activeProduct?.images?.[0] && (

            <motion.div
              key={`${activeBanner.id}-${productIndex}`}
              className="
                absolute
                right-[5%]
                sm:right-[8%]
                md:right-[10%]
                lg:right-[12%]

                bottom-[17%]

                w-[58%]
                sm:w-[52%]
                md:w-[48%]
                lg:w-[44%]

                h-[65%]

                z-20
              "

              initial={{
                opacity: 0,
                x: 50,
                scale: 0.88,
              }}

              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}

              exit={{
                opacity: 0,
                x: -35,
                scale: 0.92,
              }}

              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
            >

              {/* ==================================================
                  AMBIENT PRODUCT GLOW
              ================================================== */}

              <motion.div
                className="
                  absolute
                  left-1/2
                  top-[18%]
                  -translate-x-1/2

                  w-[75%]
                  aspect-square

                  rounded-full
                  bg-orange-400/30
                  blur-[55px]
                "

                animate={{
                  scale: [
                    0.95,
                    1.08,
                    0.95,
                  ],
                  opacity: [
                    0.4,
                    0.65,
                    0.4,
                  ],
                }}

                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />


              {/* ==================================================
                  PRODUCT SHADOW
              ================================================== */}

              <motion.div
                className="
                  absolute
                  left-1/2
                  bottom-[18%]
                  -translate-x-1/2

                  w-[55%]
                  h-[9%]

                  rounded-[50%]

                  bg-black/60
                  blur-xl
                "

                animate={{
                  scaleX: [
                    1,
                    0.78,
                    1,
                  ],

                  opacity: [
                    0.55,
                    0.3,
                    0.55,
                  ],
                }}

                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />


              {/* ==================================================
                  PRODUCT
              ================================================== */}

              <motion.div
                className="
                  absolute
                  inset-x-[5%]
                  top-0
                  bottom-[18%]
                "

                animate={{
                  y: [
                    0,
                    -9,
                    0,
                  ],

                  rotate: [
                    -1,
                    1,
                    -1,
                  ],
                }}

                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >

                <Image
                  src={
                    activeProduct.images[0]
                  }
                  alt={
                    activeProduct.name ||
                    activeBanner.heading ||
                    'Featured product'
                  }
                  fill
                  sizes="
                    (max-width: 640px) 60vw,
                    (max-width: 1024px) 50vw,
                    45vw
                  "
                  className="
                    object-contain

                    drop-shadow-[0_25px_30px_rgba(0,0,0,0.35)]
                    pointer-events-none
                  "
                  priority
                />

              </motion.div>


              {/* ==================================================
                  PODIUM
              ================================================== */}

              <motion.div
                className="
                  absolute
                  left-1/2
                  bottom-[5%]
                  -translate-x-1/2

                  w-[82%]
                  h-[22%]

                  rounded-[50%]

                  border
                  border-orange-200/50

                  shadow-[0_25px_45px_rgba(0,0,0,0.35)]

                  overflow-hidden
                "

                style={{
                  background:
                    podiumGradient,
                }}

                animate={{
                  scaleX: [
                    1,
                    1.015,
                    1,
                  ],
                }}

                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >

                {/* Podium top */}

                <div
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-[48%]

                    rounded-[50%]

                    bg-gradient-to-b
                    from-orange-200/80
                    via-orange-400/40
                    to-transparent

                    border-b
                    border-orange-100/40
                  "
                />

                {/* Front reflection */}

                <div
                  className="
                    absolute
                    left-[8%]
                    right-[8%]
                    bottom-[12%]
                    h-[8%]

                    rounded-full

                    bg-white/30
                    blur-md
                  "
                />

                {/* Bottom glow */}

                <div
                  className="
                    absolute
                    -bottom-5
                    left-[10%]
                    right-[10%]
                    h-8

                    rounded-full

                    bg-orange-400/70
                    blur-xl
                  "
                />

              </motion.div>

            </motion.div>

          )}

        </AnimatePresence>


        {/* ========================================================
            PRODUCT PROGRESS
        ======================================================== */}

        <div
          className="
            absolute
            bottom-3
            left-1/2
            -translate-x-1/2
            z-30

            flex
            items-center
            gap-1.5
          "
        >

          {products.map((_, i) => (

            <div
              key={i}
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-500

                ${
                  i === productIndex
                    ? 'w-7 bg-white'
                    : 'w-1.5 bg-white/45'
                }
              `}
            />

          ))}

        </div>


        {/* ========================================================
            NEXT CATEGORY ARROW
        ======================================================== */}

        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}

          className="
            absolute
            right-4
            bottom-4

            sm:right-6
            sm:bottom-6

            md:right-8
            md:bottom-8

            z-40

            w-10
            h-10
            sm:w-11
            sm:h-11

            rounded-full

            bg-orange-500
            text-white

            shadow-xl

            flex
            items-center
            justify-center

            transition

            hover:bg-orange-400
            hover:scale-110
            active:scale-95
          "
        >

          <ChevronRight
            className="
              w-5
              h-5
            "
          />

        </button>


        {/* ========================================================
            PREVIOUS BUTTON
        ======================================================== */}

        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}

          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2

            z-40

            w-9
            h-9

            rounded-full

            bg-black/20
            backdrop-blur-md

            border
            border-white/20

            text-white

            flex
            items-center
            justify-center

            opacity-0
            hover:opacity-100

            transition

            md:flex
          "
        >

          <ChevronLeft
            className="w-5 h-5"
          />

        </button>


        {/* ========================================================
            CATEGORY DOTS
        ======================================================== */}

        <div
          className="
            absolute
            bottom-2
            left-1/2
            -translate-x-1/2
            translate-y-full

            hidden
          "
        />

      </div>


      {/* ==========================================================
          CATEGORY INDICATORS
      ========================================================== */}

      <div
        className="
          flex
          justify-center
          items-center
          gap-1.5
          mt-3
        "
      >

        {banners.map((banner, i) => (

          <button
            key={banner.id}
            onClick={() => {
              setCurrent(i);
              setProductIndex(0);
            }}

            className="
              h-1.5
              rounded-full
              transition-all
              duration-300
            "

            style={{
              width:
                i === current
                  ? '28px'
                  : '7px',

              backgroundColor:
                i === current
                  ? '#f97316'
                  : '#d1d5db',
            }}

            aria-label={
              `Go to ${banner.heading || 'category'}`
            }
          />

        ))}

      </div>

    </div>
  );
}