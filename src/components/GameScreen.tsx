"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  getEnemiesForScreen,
  getInitialEnemies,
  getCollidingEnemy,
  isPlayerTouchingEnemy,
  updateEnemies,
  type Enemy,
} from "@/lib/gameEnemies";

type Point = {
  x: number;
  y: number;
};

type Direction = "left" | "right";
type ScreenPosition = {
  row: number;
  col: number;
};

const PLAYER_SPEED = 18;
const LADDER_CLIMB_SPEED = 24;
const JUMP_VELOCITY = -100;
const GRAVITY = 150;
const MAX_FALL_SPEED = 56;
const PLATFORM_SURFACE_OFFSET = 4.0;
const SCREEN_TRANSITION_HOLD_SECONDS = 0.6;
const STAGE_BOUNDS = {
  minX: 4,
  maxX: 96,
  topY: 4,
  bottomY: 95,
};
const LADDER_X_RANGE = {
  min: 84,
  max: 96,
};
const LADDER_Y_RANGE = {
  min: 0,
  max: 34,
};
const BOTTOM_FLOOR_VISUAL_OFFSET = 2;

const platforms = [
  { label: "開始地点", x: 13, y: 68, size: 4, blocks: 3 },
  { label: "中央足場", x: 39, y: 51, size: 3.6, blocks: 3 },
  { label: "岩棚", x: 57, y: 55, size: 3.6, blocks: 3 },
  { label: "配達先", x: 69, y: 68, size: 4, blocks: 3 },
  { label: "上層通路", x: 82, y: 33, size: 3.6, blocks: 3 },
] as const;

const block2Platforms = [
  { label: "長い足場A", x: 31, y: 82, size: 4, blocks: 6, imageSrc: "/block2.png" },
  { label: "長い足場B", x: 76, y: 48, size: 4, blocks: 6, imageSrc: "/block2.png" },
] as const;

const ladderBasePlatforms = [
  { label: "はしご下足場", x: 90, y: 100, size: 4, blocks: 3 },
] as const;

const secondRowPlatforms = [
  { label: "2段目左足場", x: 13, y: 48, size: 4, blocks: 3 },
  { label: "2段目中央足場", x: 43, y: 70, size: 4, blocks: 4 },
  { label: "2段目右足場", x: 78, y: 56, size: 4, blocks: 3 },
  {
    label: "2段目長い足場",
    x: 58,
    y: 86,
    size: 4,
    blocks: 6,
    imageSrc: "/block2.png",
  },
] as const;

const bottomFloorPlatforms = Array.from({ length: 24 }, (_, index) => ({
  label: `下端ブロック${index + 1}`,
  x: 2 + index * 4,
  y: 100,
  size: 4,
}));

type Platform = {
  label: string;
  x: number;
  y: number;
  size: number;
  blocks?: number;
  imageSrc?: string;
};

const START_PLATFORM = platforms[0];
const START_POSITION: Point = {
  x: START_PLATFORM.x,
  y: getPlatformTop(START_PLATFORM),
};
const START_SCREEN: ScreenPosition = { row: 1, col: 1 };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isGoalScreen(screen: ScreenPosition) {
  return screen.row === 3 && screen.col === 4;
}

function getMaxColForRow(row: number) {
  return row === 3 ? 4 : 3;
}

function getRoomBackground(screen: ScreenPosition) {
  return isGoalScreen(screen)
    ? {
        alt: "溶岩の光が差し込むゴールの洞窟",
        src: "/goal.png",
      }
    : {
        alt: "青く光る結晶がある洞窟の背景",
        src: "/map.png",
      };
}

function shouldShowLadder(screen: ScreenPosition) {
  return screen.row >= 2 && screen.row <= 3 && screen.col <= 3;
}

function isOnLadder(point: Point, screen: ScreenPosition) {
  return (
    shouldShowLadder(screen) &&
    point.x >= LADDER_X_RANGE.min &&
    point.x <= LADDER_X_RANGE.max &&
    point.y >= LADDER_Y_RANGE.min &&
    point.y <= LADDER_Y_RANGE.max
  );
}

function getPlatformTop(platform: Platform) {
  return platform.y - platform.size / 2 - PLATFORM_SURFACE_OFFSET;
}

function getPlatformBlockCount(platform: Platform) {
  return platform.blocks ?? 1;
}

function getPlatformImageSrc(platform: Platform) {
  return platform.imageSrc ?? "/block.png";
}

function getPlatformVisualTop(platform: Platform) {
  return platform.label.startsWith("下端ブロック")
    ? platform.y + BOTTOM_FLOOR_VISUAL_OFFSET
    : platform.y;
}

function getPlatformLeft(platform: Platform) {
  return platform.x - (platform.size * getPlatformBlockCount(platform)) / 2;
}

function getPlatformRight(platform: Platform) {
  return platform.x + (platform.size * getPlatformBlockCount(platform)) / 2;
}

function getActivePlatforms(screen: ScreenPosition) {
  if (isGoalScreen(screen)) {
    return [];
  }

  if (screen.row === 2) {
    return [...secondRowPlatforms, ...ladderBasePlatforms];
  }

  return screen.row === 3
    ? [
        ...platforms,
        ...block2Platforms,
        ...bottomFloorPlatforms,
      ]
    : [...platforms, ...block2Platforms, ...ladderBasePlatforms];
}

function findPlatformTopAtPoint(point: Point, activePlatforms: Platform[]) {
  return activePlatforms.find((platform) => {
    const isOnTopEdge = Math.abs(point.y - getPlatformTop(platform)) < 0.4;

    return (
      isOnTopEdge &&
      point.x >= getPlatformLeft(platform) &&
      point.x <= getPlatformRight(platform)
    );
  });
}

function findLandingPlatform(
  x: number,
  fromY: number,
  toY: number,
  activePlatforms: Platform[],
) {
  return activePlatforms
    .filter((platform) => {
      const platformTop = getPlatformTop(platform);

      return (
        x >= getPlatformLeft(platform) &&
        x <= getPlatformRight(platform) &&
        platformTop >= fromY &&
        platformTop <= toY
      );
    })
    .sort((a, b) => getPlatformTop(a) - getPlatformTop(b))[0];
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
  const [player, setPlayer] = useState<Point>(START_POSITION);
  const [facing, setFacing] = useState<Direction>("right");
  const [isMoving, setIsMoving] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isGrounded, setIsGrounded] = useState(true);
  const [screen, setScreen] = useState<ScreenPosition>(START_SCREEN);
  const [playerHP, setPlayerHP] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [enemies, setEnemies] = useState<Enemy[]>(() => getInitialEnemies());
  const [isEnemyContact, setIsEnemyContact] = useState(false);
  const roomBackground = getRoomBackground(screen);
  const visibleEnemies = getEnemiesForScreen(enemies, screen);
  const pressedKeysRef = useRef(new Set<string>());
  const playerRef = useRef<Point>(START_POSITION);
  const enemiesRef = useRef<Enemy[]>(enemies);
  const playerHPRef = useRef(100);
  const enemyContactRef = useRef(false);
  const isGameOverRef = useRef(false);
  const verticalVelocityRef = useRef(0);
  const isGroundedRef = useRef(true);
  const screenRef = useRef<ScreenPosition>(START_SCREEN);
  const screenTransitionHoldRef = useRef(0);

  function resetGame() {
    pressedKeysRef.current.clear();
    verticalVelocityRef.current = 0;
    isGroundedRef.current = true;
    screenTransitionHoldRef.current = 0;
    enemyContactRef.current = false;
    isGameOverRef.current = false;
    setIsMoving(false);
    setIsJumping(false);
    setIsGrounded(true);
    setIsEnemyContact(false);
    setIsGameOver(false);
    screenRef.current = START_SCREEN;
    playerRef.current = START_POSITION;
    enemiesRef.current = getInitialEnemies();
    playerHPRef.current = 100;
    setScreen(START_SCREEN);
    setFacing("right");
    setPlayer(START_POSITION);
    setPlayerHP(100);
    setEnemies(enemiesRef.current);
  }

  useEffect(() => {
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
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      if (isGameOverRef.current) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      enemiesRef.current = updateEnemies(enemiesRef.current, deltaSeconds);
      setEnemies(enemiesRef.current);

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
        const nextScreen = {
          row: previousScreen.row,
          col: clamp(
            previousScreen.col + 1,
            1,
            getMaxColForRow(previousScreen.row),
          ),
        };

        if (nextScreen.col !== previousScreen.col) {
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
        const nextScreen = {
          row: previousScreen.row,
          col: clamp(previousScreen.col - 1, 1, getMaxColForRow(previousScreen.row)),
        };

        if (nextScreen.col !== previousScreen.col) {
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
            row: clamp(previousScreen.row - 1, 1, 3),
            col: previousScreen.col,
          };

          if (nextScreen.row !== previousScreen.row) {
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
        } else if (nextY > STAGE_BOUNDS.bottomY) {
          const previousScreen = screenRef.current;
          const nextScreen = {
            row: clamp(previousScreen.row + 1, 1, 3),
            col: previousScreen.col,
          };
          screenRef.current = nextScreen;
          setScreen(nextScreen);

          if (nextScreen.row === previousScreen.row) {
            nextY = STAGE_BOUNDS.bottomY;
            verticalVelocityRef.current = 0;
            isGroundedRef.current = true;
            setIsGrounded(true);
            setIsJumping(false);
          } else {
            nextY = 0;
            verticalVelocityRef.current = MAX_FALL_SPEED;
            isGroundedRef.current = false;
            screenTransitionHoldRef.current = SCREEN_TRANSITION_HOLD_SECONDS;
            setIsGrounded(false);
            setIsJumping(false);
          }
        }
      }

      const nextPlayer = { x: nextX, y: nextY };
      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);

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
  }, []);

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

        <div className="absolute left-4 top-4 z-20 min-w-40 rounded-lg border border-white/10 bg-black/55 px-4 py-3 text-sm text-stone-100 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-sm">
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
            <div className="relative h-full w-full overflow-hidden rounded-[35%_35%_18%_18%] border border-red-200/35 bg-black/0">
              <Image
                src={enemy.spriteSrc ?? "/dog_right.png"}
                alt="敵"
                fill
                sizes="(min-width: 1024px) 5rem, 12vw"
                className="object-contain"
              />
            </div>
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
              <p className="mt-4 text-xs text-stone-500">Rキーでもリスタートできます。</p>
            </div>
          </div>
        ) : null}
      </section>

    </div>
  );
}
