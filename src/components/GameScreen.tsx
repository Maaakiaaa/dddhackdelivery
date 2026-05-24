"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import GameTimer from "@/components/GameTimer";
import ItemBag from "@/components/ItemBag";
import {
  DELIVERY_ITEMS,
  MAP_ITEM_PLACEMENTS,
  type MapItemPlacement,
} from "@/data/item-list";
import {
  getEnemiesForScreen,
  getInitialEnemies,
  getCollidingEnemy,
  getChasingEnemy,
  updateEnemies,
  type Enemy,
} from "@/lib/gameEnemies";
import {
  getMaxRow,
  getMinRow,
  getRoomBackground,
  getScreenBelow,
  getScreenLeft,
  getScreenRight,
  isOnLadder,
  LADDER_Y_RANGE,
  shouldShowLadder,
  START_SCREEN,
  type ScreenPosition,
} from "@/lib/gameMap";
import {
  findLandingPlatform,
  findPlatformTopAtPoint,
  getActivePlatforms,
  getPlatformBlockCount,
  getPlatformImageSrc,
  getPlatformTop,
  getPlatformVisualTop,
  START_PLATFORM,
} from "@/lib/gamePlatforms";

type Point = {
  x: number;
  y: number;
};

type Direction = "left" | "right";

type Bullet = {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  damage: number;
};

type InventoryCounts = Record<string, number>;

type PickupItem = MapItemPlacement & {
  size: number;
};

const STARTING_ITEM_COUNT_LIMIT = 3;
const PICKUP_HEAL_AMOUNT = 50;
const PLAYER_SPEED = 18;
const BULLET_SPEED = 55;
const BULLET_DAMAGE = 15;
const BULLET_SIZE_PERCENT = 1.4;
const BULLET_IMAGE_SRC = "/bullet.png";
const DEFAULT_PICKUP_SIZE_PERCENT = 5;
const PLAYER_HITBOX = {
  width: 4.6,
  height: 10,
};
const SHOOT_DIRECTION_VECTORS = [
  { dx: 0.83, dy: -0.56 },
  { dx: 1, dy: 0 },
  { dx: 0.83, dy: 0.56 },
] as const;
const LADDER_CLIMB_SPEED = 24;
const JUMP_VELOCITY = -100;
const GRAVITY = 150;
const MAX_FALL_SPEED = 56;
const SCREEN_TRANSITION_HOLD_SECONDS = 0.6;
const STAGE_BOUNDS = {
  minX: 4,
  maxX: 96,
  topY: 4,
  bottomY: 95,
};
const START_POSITION: Point = {
  x: START_PLATFORM.x,
  y: getPlatformTop(START_PLATFORM),
};

function getEmptyInventory() {
  return DELIVERY_ITEMS.reduce<InventoryCounts>((inventory, item) => {
    inventory[item.id] = 0;
    return inventory;
  }, {});
}

function cloneInventory(inventory: InventoryCounts) {
  return DELIVERY_ITEMS.reduce<InventoryCounts>((nextInventory, item) => {
    nextInventory[item.id] = inventory[item.id] ?? 0;
    return nextInventory;
  }, {});
}

function getInitialPickupItems() {
  return MAP_ITEM_PLACEMENTS.map((item) => ({
    ...item,
    screen: { ...item.screen },
    size: item.size ?? DEFAULT_PICKUP_SIZE_PERCENT,
  }));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}


function isMovementKey(key: string) {
  return [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "w",
    "s",
    "a",
    "d",
    "W",
    "S",
    "A",
    "D",
  ].includes(key);
}

function getMovement(keys: Set<string>) {
  const up = keys.has("ArrowUp") || keys.has("w") || keys.has("W");
  const down = keys.has("ArrowDown") || keys.has("s") || keys.has("S");
  const left = keys.has("ArrowLeft") || keys.has("a") || keys.has("A");
  const right = keys.has("ArrowRight") || keys.has("d") || keys.has("D");
  const dx = Number(right) - Number(left);
  const climbY = Number(down) - Number(up);

  return { climbY, dx };
}

export default function GameScreen() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameRunId, setGameRunId] = useState(0);
  const [inventory, setInventory] = useState<InventoryCounts>(() =>
    getEmptyInventory(),
  );
  const [draftInventory, setDraftInventory] = useState<InventoryCounts>(() =>
    getEmptyInventory(),
  );
  const [pickupItems, setPickupItems] = useState<PickupItem[]>(() =>
    getInitialPickupItems(),
  );
  const [player, setPlayer] = useState<Point>(START_POSITION);
  const [facing, setFacing] = useState<Direction>("right");
  const [isMoving, setIsMoving] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isGrounded, setIsGrounded] = useState(true);
  const [screen, setScreen] = useState<ScreenPosition>(START_SCREEN);
  const [playerHP, setPlayerHP] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [enemies, setEnemies] = useState<Enemy[]>(() => getInitialEnemies());
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [isEnemyContact, setIsEnemyContact] = useState(false);
  const roomBackground = getRoomBackground(screen);
  const visibleEnemies = getEnemiesForScreen(enemies, screen);
  const visiblePickupItems = pickupItems.filter(
    (item) => item.screen.row === screen.row && item.screen.col === screen.col,
  );
  const pressedKeysRef = useRef(new Set<string>());
  const bulletsRef = useRef<Bullet[]>([]);
  const shootTimerRef = useRef(0);
  const bulletIdCounterRef = useRef(0);
  const playerRef = useRef<Point>(START_POSITION);
  const enemiesRef = useRef<Enemy[]>(enemies);
  const playerHPRef = useRef(100);
  const enemyContactRef = useRef(false);
  const isGameOverRef = useRef(false);
  const verticalVelocityRef = useRef(0);
  const isGroundedRef = useRef(true);
  const screenRef = useRef<ScreenPosition>(START_SCREEN);
  const screenTransitionHoldRef = useRef(0);
  const inventoryRef = useRef<InventoryCounts>(getEmptyInventory());
  const startingInventoryRef = useRef<InventoryCounts>(getEmptyInventory());
  const pickupItemsRef = useRef<PickupItem[]>(getInitialPickupItems());
  const enemyShootTimersRef = useRef<Record<string, number>>({});

  function updateDraftItemCount(itemId: string, delta: number) {
    setDraftInventory((current) => ({
      ...current,
      [itemId]: clamp(
        (current[itemId] ?? 0) + delta,
        0,
        STARTING_ITEM_COUNT_LIMIT,
      ),
    }));
  }

  function resetGame() {
    const initialInventory = cloneInventory(startingInventoryRef.current);

    pressedKeysRef.current.clear();
    verticalVelocityRef.current = 0;
    isGroundedRef.current = true;
    screenTransitionHoldRef.current = 0;
    enemyContactRef.current = false;
    isGameOverRef.current = false;
    bulletsRef.current = [];
    shootTimerRef.current = 0;
    bulletIdCounterRef.current = 0;
    setIsMoving(false);
    setIsJumping(false);
    setIsGrounded(true);
    setIsEnemyContact(false);
    setIsGameOver(false);
    screenRef.current = START_SCREEN;
    playerRef.current = START_POSITION;
    enemiesRef.current = getInitialEnemies();
    pickupItemsRef.current = getInitialPickupItems();
    inventoryRef.current = initialInventory;
    playerHPRef.current = 100;
    setScreen(START_SCREEN);
    setFacing("right");
    setPlayer(START_POSITION);
    setPlayerHP(100);
    setEnemies(enemiesRef.current);
    setPickupItems(pickupItemsRef.current);
    setInventory(initialInventory);
    setBullets([]);
    setGameRunId((current) => current + 1);
  }

  function startGame() {
    startingInventoryRef.current = cloneInventory(draftInventory);
    resetGame();
    setIsGameStarted(true);
  }

  function returnToItemSetup() {
    setIsGameStarted(false);
    setIsGameOver(false);
    isGameOverRef.current = false;
  }

  useEffect(() => {
    if (!isGameStarted) {
      return;
    }

    let animationFrameId = 0;
    let lastTime = performance.now();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        resetGame();
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();

        if (isGroundedRef.current) {
          verticalVelocityRef.current = JUMP_VELOCITY;
          isGroundedRef.current = false;
          setIsJumping(true);
          setIsGrounded(false);
        }

        return;
      }

      if (!isMovementKey(event.key)) {
        return;
      }

      event.preventDefault();
      pressedKeysRef.current.add(event.key);
      setIsMoving(true);
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (!isMovementKey(event.key)) {
        return;
      }

      pressedKeysRef.current.delete(event.key);
      setIsMoving(pressedKeysRef.current.size > 0);
    }

    function handleBlur() {
      pressedKeysRef.current.clear();
      setIsMoving(false);
    }

    function tick(currentTime: number) {
      const deltaSeconds = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      if (screenTransitionHoldRef.current > 0) {
        screenTransitionHoldRef.current = Math.max(
          screenTransitionHoldRef.current - deltaSeconds,
          0,
        );
      }

      if (isGameOverRef.current) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      enemiesRef.current = updateEnemies(enemiesRef.current, deltaSeconds);
      enemiesRef.current = enemiesRef.current.map((enemy) => {
        if (enemy.movementType !== "chase") {
          return enemy;
        }

        if (
          enemy.screen.row !== screenRef.current.row ||
          enemy.screen.col !== screenRef.current.col
        ) {
          return enemy;
        }

        return getChasingEnemy(
          enemy,
          playerRef.current,
          getActivePlatforms(screenRef.current),
          deltaSeconds,
        );
      });
      setEnemies(enemiesRef.current);

      bulletsRef.current = bulletsRef.current
        .map((bullet) => ({
          ...bullet,
          x: bullet.x + bullet.dx * bullet.speed * deltaSeconds,
          y: bullet.y + bullet.dy * bullet.speed * deltaSeconds,
        }))
        .filter(
          (bullet) =>
            bullet.x >= 0 &&
            bullet.x <= 100 &&
            bullet.y >= 0 &&
            bullet.y <= 100,
        );
      setBullets(bulletsRef.current);

const shooters = enemiesRef.current.filter(
  (enemy) =>
    enemy.shootInterval &&
    enemy.screen.row === screenRef.current.row &&
    enemy.screen.col === screenRef.current.col,
);

const createdBullets: Bullet[] = [];

for (const shooter of shooters) {
  const currentTimer =
    enemyShootTimersRef.current[shooter.id] ??
    shooter.shootInterval ??
    2.2;

  const nextTimer = currentTimer - deltaSeconds;

  if (nextTimer <= 0) {
    const baseId = bulletIdCounterRef.current++;

    const bulletOrigin = {
      x: shooter.x,
      y: shooter.y - shooter.height * 0.5,
    };

    const directionSign = shooter.direction;

    const newBullets = SHOOT_DIRECTION_VECTORS.map(
      (direction, index) => ({
        id: `bullet-${baseId}-${index}`,
        x: bulletOrigin.x,
        y: bulletOrigin.y,
        dx: direction.dx * directionSign,
        dy: direction.dy,
        speed: BULLET_SPEED,
        damage: BULLET_DAMAGE,
      }),
    );

    createdBullets.push(...newBullets);

    enemyShootTimersRef.current[shooter.id] =
      shooter.shootInterval ?? 2.2;
  } else {
    enemyShootTimersRef.current[shooter.id] = nextTimer;
  }
}

if (createdBullets.length > 0) {
  bulletsRef.current = [
    ...bulletsRef.current,
    ...createdBullets,
  ];

  setBullets(bulletsRef.current);
}

      const { climbY, dx } = getMovement(pressedKeysRef.current);

      if (dx < 0) {
        setFacing("left");
      } else if (dx > 0) {
        setFacing("right");
      }

      const current = playerRef.current;
      const rawNextX = current.x + dx * PLAYER_SPEED * deltaSeconds;
      let nextX = clamp(rawNextX, STAGE_BOUNDS.minX, STAGE_BOUNDS.maxX);
      let nextY = current.y;

      if (dx > 0 && rawNextX >= STAGE_BOUNDS.maxX) {
        const previousScreen = screenRef.current;
        const nextScreen = getScreenRight(previousScreen);

        if (nextScreen !== null && screenTransitionHoldRef.current <= 0) {
          nextX = STAGE_BOUNDS.minX;
          screenRef.current = nextScreen;
          screenTransitionHoldRef.current = SCREEN_TRANSITION_HOLD_SECONDS;
          setScreen(nextScreen);

          const nextPlayer = { x: nextX, y: nextY };
          playerRef.current = nextPlayer;
          setPlayer(nextPlayer);

          animationFrameId = requestAnimationFrame(tick);
          return;
        }
      }

      if (dx < 0 && rawNextX <= STAGE_BOUNDS.minX) {
        const previousScreen = screenRef.current;
        const nextScreen = getScreenLeft(previousScreen);

        if (nextScreen !== null && screenTransitionHoldRef.current <= 0) {
          nextX = STAGE_BOUNDS.maxX;
          screenRef.current = nextScreen;
          screenTransitionHoldRef.current = SCREEN_TRANSITION_HOLD_SECONDS;
          setScreen(nextScreen);

          const nextPlayer = { x: nextX, y: nextY };
          playerRef.current = nextPlayer;
          setPlayer(nextPlayer);

          animationFrameId = requestAnimationFrame(tick);
          return;
        }
      }

      const activePlatforms = getActivePlatforms(screenRef.current);
      const ladderPoint = { x: nextX, y: current.y };
      const isClimbingLadder =
        climbY !== 0 && isOnLadder(ladderPoint, screenRef.current);
      const standingPlatform = findPlatformTopAtPoint(
        {
          x: nextX,
          y: current.y,
        },
        activePlatforms,
      );

      if (isClimbingLadder) {
        nextY = clamp(
          current.y + climbY * LADDER_CLIMB_SPEED * deltaSeconds,
          LADDER_Y_RANGE.min,
          LADDER_Y_RANGE.max,
        );
        verticalVelocityRef.current = 0;
        isGroundedRef.current = false;
        setIsGrounded(false);
        setIsJumping(false);

        if (climbY < 0 && nextY <= STAGE_BOUNDS.topY) {
          const previousScreen = screenRef.current;
          const nextScreen = {
            row: clamp(previousScreen.row - 1, getMinRow(), getMaxRow()),
            col: previousScreen.col,
          };

          if (
            nextScreen.row !== previousScreen.row &&
            screenTransitionHoldRef.current <= 0
          ) {
            screenRef.current = nextScreen;
            setScreen(nextScreen);
            nextY = STAGE_BOUNDS.bottomY - 8;
            screenTransitionHoldRef.current = SCREEN_TRANSITION_HOLD_SECONDS;
          }
        }
      } else if (isGroundedRef.current && standingPlatform) {
        nextY = getPlatformTop(standingPlatform);
        verticalVelocityRef.current = 0;
      } else {
        if (isGroundedRef.current) {
          isGroundedRef.current = false;
          setIsGrounded(false);
        }

        const previousY = current.y;
        verticalVelocityRef.current = clamp(
          verticalVelocityRef.current + GRAVITY * deltaSeconds,
          JUMP_VELOCITY,
          MAX_FALL_SPEED,
        );
        nextY = current.y + verticalVelocityRef.current * deltaSeconds;

        const landingPlatform =
          verticalVelocityRef.current >= 0
            ? findLandingPlatform(nextX, previousY, nextY, activePlatforms)
            : undefined;

        if (landingPlatform) {
          nextY = getPlatformTop(landingPlatform);
          verticalVelocityRef.current = 0;
          isGroundedRef.current = true;
          setIsGrounded(true);
          setIsJumping(false);
        } else {
          const canMoveToScreenBelow = getScreenBelow(screenRef.current) !== null;
          const bottomTransitionY =
            activePlatforms.length === 0 && canMoveToScreenBelow
              ? STAGE_BOUNDS.bottomY - 6
              : STAGE_BOUNDS.bottomY;

          if (nextY >= bottomTransitionY) {
            const previousScreen = screenRef.current;
            const nextScreen = getScreenBelow(previousScreen);

            if (nextScreen === null) {
              nextY = STAGE_BOUNDS.bottomY;
              verticalVelocityRef.current = 0;
              isGroundedRef.current = true;
              setIsGrounded(true);
              setIsJumping(false);
            } else if (screenTransitionHoldRef.current <= 0) {
              screenRef.current = nextScreen;
              setScreen(nextScreen);
              nextY = 0;
              verticalVelocityRef.current = MAX_FALL_SPEED;
              isGroundedRef.current = false;
              screenTransitionHoldRef.current = SCREEN_TRANSITION_HOLD_SECONDS;
              setIsGrounded(false);
              setIsJumping(false);
            }
          }
        }
      }

      const nextPlayer = { x: nextX, y: nextY };
      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);

      const playerRect = {
        left: nextPlayer.x - PLAYER_HITBOX.width / 2,
        right: nextPlayer.x + PLAYER_HITBOX.width / 2,
        top: nextPlayer.y - PLAYER_HITBOX.height,
        bottom: nextPlayer.y,
      };

      const pickupHit = pickupItemsRef.current.find((item) => {
        if (
          item.screen.row !== screenRef.current.row ||
          item.screen.col !== screenRef.current.col
        ) {
          return false;
        }

        const halfSize = item.size / 2;
        const itemRect = {
          left: item.x - halfSize,
          right: item.x + halfSize,
          top: item.y - halfSize,
          bottom: item.y + halfSize,
        };

        return (
          itemRect.left < playerRect.right &&
          itemRect.right > playerRect.left &&
          itemRect.top < playerRect.bottom &&
          itemRect.bottom > playerRect.top
        );
      });

      if (pickupHit) {
        const currentCount = inventoryRef.current[pickupHit.itemId] ?? 0;
        const nextInventory = {
          ...inventoryRef.current,
          [pickupHit.itemId]: currentCount + 1,
        };
        const nextHP = playerHPRef.current + PICKUP_HEAL_AMOUNT;

        inventoryRef.current = nextInventory;
        playerHPRef.current = nextHP;
        pickupItemsRef.current = pickupItemsRef.current.filter(
          (item) => item.id !== pickupHit.id,
        );
        setInventory(nextInventory);
        setPlayerHP(nextHP);
        setPickupItems(pickupItemsRef.current);
      }

      const collidingEnemy = getCollidingEnemy(
        nextPlayer,
        enemiesRef.current,
        screenRef.current,
      );
      const contact = Boolean(collidingEnemy);

      if (contact && !enemyContactRef.current && collidingEnemy) {
        const damage = collidingEnemy.damage ?? 30;
        const nextHP = Math.max(playerHPRef.current - damage, 0);
        playerHPRef.current = nextHP;
        setPlayerHP(nextHP);

        if (nextHP === 0) {
          isGameOverRef.current = true;
          setIsGameOver(true);
        }
      }

      const bulletHit = bulletsRef.current.find((bullet) => {
        const halfSize = BULLET_SIZE_PERCENT / 2;
        const bulletRect = {
          left: bullet.x - halfSize,
          right: bullet.x + halfSize,
          top: bullet.y - halfSize,
          bottom: bullet.y + halfSize,
        };

        return (
          bulletRect.left < playerRect.right &&
          bulletRect.right > playerRect.left &&
          bulletRect.top < playerRect.bottom &&
          bulletRect.bottom > playerRect.top
        );
      });

      if (bulletHit) {
        bulletsRef.current = bulletsRef.current.filter(
          (bullet) => bullet.id !== bulletHit.id,
        );
        setBullets(bulletsRef.current);

        const nextHP = Math.max(playerHPRef.current - bulletHit.damage, 0);
        playerHPRef.current = nextHP;
        setPlayerHP(nextHP);

        if (nextHP === 0) {
          isGameOverRef.current = true;
          setIsGameOver(true);
        }
      }

      enemyContactRef.current = contact;
      setIsEnemyContact(contact);

      animationFrameId = requestAnimationFrame(tick);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGameStarted]);

  const totalDraftItems = DELIVERY_ITEMS.reduce(
    (total, item) => total + (draftInventory[item.id] ?? 0),
    0,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section
        aria-label="ダンジョン探索画面"
        className="relative h-[calc(100dvh-6.75rem)] min-h-[24rem] w-full overflow-hidden rounded-[1.5rem] border border-[var(--panel-border)] bg-black shadow-[0_32px_120px_rgba(0,0,0,0.5)] outline-none"
        data-testid="game-stage"
        tabIndex={0}
      >
        <Image
          src={roomBackground.src}
          alt={roomBackground.alt}
          fill
          priority
          sizes="(min-width: 1024px) 72rem, 100vw"
          className="object-cover"
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_36%,rgba(0,0,0,0.28)_100%)]" />

        {isGameStarted ? (
          <>
            <GameTimer key={gameRunId} className="bottom-4 left-4" />
            <ItemBag
              items={DELIVERY_ITEMS}
              inventory={inventory}
              className="pointer-events-none absolute right-4 top-4 z-20 max-w-[18rem]"
            />
          </>
        ) : null}

        <div className="absolute left-4 top-4 z-20 hidden min-w-40 rounded-lg border border-white/10 bg-black/55 px-4 py-3 text-sm text-stone-100 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:block">
          <p>位置: X {Math.round(player.x)} / Y {Math.round(player.y)}</p>
          <p>画面: {screen.row},{screen.col}</p>
          <p>
            状態: {isGrounded ? "接地" : isJumping ? "ジャンプ中" : "落下中"}
          </p>
          <p>HP: {playerHP}</p>
        </div>

        {shouldShowLadder(screen) ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[4%] top-0 z-10 flex w-[4.4%] flex-col gap-0 drop-shadow-[0_12px_14px_rgba(0,0,0,0.55)]"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`ladder-${index}`}
                className={`relative aspect-square w-full overflow-hidden ${
                  index === 0 ? "" : "-mt-[10%]"
                }`}
              >
                <Image
                  src="/hasi.png"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 6rem, 10vw"
                  className="scale-110 object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-0">
          {getActivePlatforms(screen).map((platform) => (
            <div
              key={platform.label}
              aria-hidden="true"
              className="absolute flex drop-shadow-[0_12px_14px_rgba(0,0,0,0.55)]"
              style={{
                left: `${platform.x}%`,
                top: `${getPlatformVisualTop(platform)}%`,
                width: `${platform.size * getPlatformBlockCount(platform)}%`,
                aspectRatio: `${getPlatformBlockCount(platform)} / 1`,
                transform: "translate(-50%, -50%)",
              }}
              title={platform.label}
            >
              {getPlatformImageSrc(platform) === "/block2.png" ? (
                <Image
                  src="/block2.png"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20rem, 28vw"
                  className="object-fill"
                />
              ) : (
                Array.from({ length: getPlatformBlockCount(platform) }).map(
                  (_, index) => (
                    <div
                      key={`${platform.label}-${index}`}
                      className="relative h-full flex-1"
                    >
                      <Image
                        src="/block.png"
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 7rem, 12vw"
                        className="object-contain"
                      />
                    </div>
                  ),
                )
              )}
            </div>
          ))}
        </div>

        {visiblePickupItems.map((pickupItem) => {
          const item = DELIVERY_ITEMS.find(
            (deliveryItem) => deliveryItem.id === pickupItem.itemId,
          );

          if (item === undefined) {
            return null;
          }

          return (
            <div
              key={pickupItem.id}
              aria-label={`${item.name}を拾う`}
              className="pointer-events-none absolute z-10 rounded-md border border-amber-100/45 bg-black/35 shadow-[0_0_18px_rgba(226,199,137,0.45)]"
              style={{
                left: `${pickupItem.x}%`,
                top: `${pickupItem.y}%`,
                width: `${pickupItem.size}%`,
                aspectRatio: "1 / 1",
                transform: "translate(-50%, -50%)",
              }}
              title={item.name}
            >
              <Image
                src={item.imageSrc}
                alt={item.name}
                fill
                sizes="(min-width: 1024px) 4rem, 8vw"
                className="rounded-md object-cover"
              />
            </div>
          );
        })}

        {visibleEnemies.map((enemy) => (
          <div
            key={enemy.id}
            aria-hidden="true"
            className="pointer-events-none absolute z-10 drop-shadow-[0_8px_10px_rgba(0,0,0,0.65)]"
            style={{
              left: `${enemy.x}%`,
              top: `${enemy.y}%`,
              width: `${enemy.width * 2.1}%`,
              height: `${enemy.height * 2.1}%`,
              transform: `translate(-50%, -100%) scaleX(${enemy.direction})`,
            }}
          >
            <div className={`relative h-full w-full overflow-hidden rounded-[35%_35%_18%_18%] border border-red-200/35 bg-black/0 ${
              enemy.frameSrcs ? "enemy-frame-anim" : ""
            }`}>
              {enemy.frameSrcs ? (
                <>
                  <div className="enemy-frame frame-a">
                    <Image
                      src={enemy.frameSrcs[0]}
                      alt="敵"
                      fill
                      sizes="(min-width: 1024px) 5rem, 12vw"
                      className="object-contain"
                    />
                  </div>
                  <div className="enemy-frame frame-b">
                    <Image
                      src={enemy.frameSrcs[1]}
                      alt="敵"
                      fill
                      sizes="(min-width: 1024px) 5rem, 12vw"
                      className="object-contain"
                    />
                  </div>
                </>
              ) : (
                <Image
                  src={enemy.shootInterval ? "/bullet_enemy.png" : "/dog_right.png"}
                  alt="敵"
                  fill
                  sizes="(min-width: 1024px) 5rem, 12vw"
                  className="object-contain"
                  style={enemy.shootInterval ? { transform: "scaleX(-1)" } : undefined}
                />
              )}
            </div>
          </div>
        ))}

        {bullets.map((bullet) => (
          <div
            key={bullet.id}
            aria-hidden="true"
            className="pointer-events-none absolute z-20"
            style={{
              left: `${bullet.x}%`,
              top: `${bullet.y}%`,
              width: `${BULLET_SIZE_PERCENT}%`,
              height: `${BULLET_SIZE_PERCENT}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Image
              src={BULLET_IMAGE_SRC}
              alt="弾丸"
              fill
              sizes="4rem"
              className="object-contain scale-[3]"
            />
          </div>
        ))}

        <div
          aria-label="プレイヤー"
          className={`absolute z-10 h-[clamp(3.4rem,8vw,6.8rem)] w-[clamp(2.5rem,5.8vw,5rem)] ${
            isEnemyContact ? "ring-4 ring-red-500/70" : ""
          }`}
          data-testid="player"
          style={{
            left: `${player.x}%`,
            top: `${player.y}%`,
            transform: "translate(-50%, -92%)",
          }}
        >
          <div
            className="relative h-full w-full"
            style={{
              transform: facing === "left" ? "scaleX(-1)" : "scaleX(1)",
            }}
          >
            <Image
              src="/right.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 5rem, 12vw"
              className="object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.65)]"
            />
            <div
              className={`absolute bottom-[-8%] left-1/2 h-[14%] w-[92%] -translate-x-1/2 rounded-full bg-cyan-200/25 blur-sm ${
                isJumping
                  ? "scale-75 opacity-25"
                  : isMoving
                    ? "scale-110 opacity-80"
                    : "opacity-50"
              }`}
            />
          </div>
        </div>

        {!isGameStarted ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 px-4 py-5">
            <div className="flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-[0_32px_90px_rgba(0,0,0,0.7)]">
              <div className="flex shrink-0 flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-7">
                <div>
                  <p className="text-xs font-semibold tracking-[0.28em] text-[var(--accent)]">
                    INVENTORY SETUP
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">
                    持っていくアイテムを選択
                  </h2>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-stone-200">
                  合計 {totalDraftItems} 個
                </div>
              </div>

              <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-7">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {DELIVERY_ITEMS.map((item) => {
                    const count = draftInventory[item.id] ?? 0;

                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3"
                      >
                        <div className="relative h-16 w-16 overflow-hidden rounded-md border border-white/10 bg-black">
                          <Image
                            src={item.imageSrc}
                            alt={item.name}
                            fill
                            sizes="4rem"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-100">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-stone-400">
                            {STARTING_ITEM_COUNT_LIMIT}個まで所持可能
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`${item.name}を減らす`}
                            onClick={() => updateDraftItemCount(item.id, -1)}
                            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-black/40 text-lg leading-none text-stone-100 transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35"
                            disabled={count === 0}
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono text-lg font-bold text-white">
                            {count}
                          </span>
                          <button
                            type="button"
                            aria-label={`${item.name}を増やす`}
                            onClick={() => updateDraftItemCount(item.id, 1)}
                            className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-black/40 text-lg leading-none text-stone-100 transition hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-35"
                            disabled={count === STARTING_ITEM_COUNT_LIMIT}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <button
                  type="button"
                  onClick={() => setDraftInventory(getEmptyInventory())}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-stone-200 transition hover:border-[var(--accent)]"
                >
                  リセット
                </button>
                <button
                  type="button"
                  onClick={startGame}
                  className="rounded-lg bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  この所持数で開始
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {isGameOver ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 px-6 py-4 text-center">
            <div className="w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-slate-950/95 p-10 shadow-[0_32px_80px_rgba(0,0,0,0.65)]">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-pink-300">
                GAME OVER
              </p>
              <h2 className="mt-6 text-5xl font-semibold text-white">ゲームオーバー</h2>
              <p className="mt-4 text-base leading-7 text-stone-300">
                HPが0になりました。再挑戦するには以下のボタンを押してください。
              </p>
              <button
                type="button"
                onClick={resetGame}
                className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
              >
                もう一度挑戦する
              </button>
              <button
                type="button"
                onClick={returnToItemSetup}
                className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-7 py-3 text-sm font-semibold text-stone-100 transition hover:border-[var(--accent)]"
              >
                所持数を変更する
              </button>
              <p className="mt-4 text-xs text-stone-500">Rキーでもリスタートできます。</p>
            </div>
          </div>
        ) : null}
      </section>

    </div>
  );
}
