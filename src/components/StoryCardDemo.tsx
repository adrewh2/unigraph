import React, { useLayoutEffect, useRef, useState } from "react";

interface StoryNode {
  id: string;
  title: string;
  description: string;
  children?: StoryNode[];
}

const STORY_TREE: StoryNode[] = [
  {
    id: "root-1",
    title: "The Lost Artifact",
    description:
      "You hear rumors of a powerful artifact hidden in ancient ruins.",
    children: [
      {
        id: "artifact-1",
        title: "Enter the Ruins",
        description: "You step into the dark, echoing halls of the ruins.",
        children: [
          {
            id: "ruins-1",
            title: "Solve the Puzzle",
            description: "A mysterious puzzle blocks your path.",
          },
          {
            id: "ruins-2",
            title: "Fight the Guardian",
            description: "A stone guardian awakens to challenge you.",
          },
          {
            id: "ruins-3",
            title: "Search for Hidden Doors",
            description: "You look for secret passages in the shadows.",
          },
        ],
      },
      {
        id: "artifact-2",
        title: "Seek a Guide",
        description: "You look for a local guide to help you navigate.",
        children: [
          {
            id: "guide-1",
            title: "Trust the Old Man",
            description: "An old man offers his help, but can you trust him?",
          },
          {
            id: "guide-2",
            title: "Hire the Young Scout",
            description: "A young scout claims to know a shortcut.",
          },
          {
            id: "guide-3",
            title: "Go Alone",
            description: "You decide to brave the journey by yourself.",
          },
        ],
      },
      {
        id: "artifact-3",
        title: "Research in the Library",
        description: "You search ancient tomes for clues.",
        children: [
          {
            id: "library-1",
            title: "Decipher the Map",
            description: "A cryptic map may reveal the artifact's location.",
          },
          {
            id: "library-2",
            title: "Consult the Scholar",
            description: "A scholar offers insight for a price.",
          },
          {
            id: "library-3",
            title: "Ignore the Books",
            description: "You decide to rely on your instincts instead.",
          },
        ],
      },
    ],
  },
  {
    id: "root-2",
    title: "The Vanished Village",
    description: "A whole village has disappeared overnight.",
    children: [
      {
        id: "village-1",
        title: "Investigate the Site",
        description: "You visit the empty village to search for clues.",
        children: [
          {
            id: "site-1",
            title: "Follow the Footprints",
            description: "Strange footprints lead into the forest.",
          },
          {
            id: "site-2",
            title: "Examine the Ruins",
            description: "You find signs of a struggle.",
          },
          {
            id: "site-3",
            title: "Talk to the Locals",
            description: "Nearby villagers share their suspicions.",
          },
        ],
      },
      {
        id: "village-2",
        title: "Consult the Elders",
        description: "The village elders may know more.",
        children: [
          {
            id: "elders-1",
            title: "Hear the Legend",
            description: "An old legend may hold the answer.",
          },
          {
            id: "elders-2",
            title: "Ask About Enemies",
            description: "Did the village have any enemies?",
          },
          {
            id: "elders-3",
            title: "Offer Help",
            description: "You offer to help find the missing villagers.",
          },
        ],
      },
      {
        id: "village-3",
        title: "Search for Survivors",
        description: "You look for anyone who might have escaped.",
        children: [
          {
            id: "survivor-1",
            title: "Find a Child",
            description: "A frightened child hides in the woods.",
          },
          {
            id: "survivor-2",
            title: "Discover a Note",
            description: "A hastily written note hints at danger.",
          },
          {
            id: "survivor-3",
            title: "Hear a Whisper",
            description: "You hear a faint whisper calling for help.",
          },
        ],
      },
    ],
  },
  {
    id: "root-3",
    title: "The Cursed Forest",
    description: "Travelers avoid the forest, claiming it's cursed.",
    children: [
      {
        id: "forest-1",
        title: "Enter the Forest",
        description: "You brave the dark woods despite the warnings.",
        children: [
          {
            id: "forestpath-1",
            title: "Follow the Lights",
            description: "Strange lights dance between the trees.",
          },
          {
            id: "forestpath-2",
            title: "Mark Your Trail",
            description: "You mark trees to avoid getting lost.",
          },
          {
            id: "forestpath-3",
            title: "Camp for the Night",
            description: "You set up camp as night falls.",
          },
        ],
      },
      {
        id: "forest-2",
        title: "Ask the Hermit",
        description: "A hermit claims to know the forest's secrets.",
        children: [
          {
            id: "hermit-1",
            title: "Listen to the Warning",
            description: "The hermit warns you of a great danger.",
          },
          {
            id: "hermit-2",
            title: "Ignore the Hermit",
            description: "You dismiss the hermit's ramblings.",
          },
          {
            id: "hermit-3",
            title: "Offer a Gift",
            description: "You offer a gift to gain the hermit's trust.",
          },
        ],
      },
      {
        id: "forest-3",
        title: "Circle the Perimeter",
        description: "You walk the edge of the forest, looking for clues.",
        children: [
          {
            id: "perimeter-1",
            title: "Find Strange Symbols",
            description: "Odd symbols are carved into the trees.",
          },
          {
            id: "perimeter-2",
            title: "Spot a Shadow",
            description: "A shadowy figure watches from afar.",
          },
          {
            id: "perimeter-3",
            title: "Hear a Distant Cry",
            description: "A distant cry echoes through the woods.",
          },
        ],
      },
    ],
  },
];

type CardPos = "left" | "center" | "right";

const CARD_POSITIONS: CardPos[] = ["left", "center", "right"];

function getCardPosition(index: number, total: number): CardPos {
  if (total === 1) return "center";
  if (total === 2) return index === 0 ? "left" : "right";
  if (total === 3) return ["left", "center", "right"][index] as CardPos;
  // fallback
  return "center";
}

function StoryCard({
  node,
  onSelect,
  expanded,
  animateFromRect,
  showBack,
  onBack,
}: {
  node: StoryNode;
  onSelect: (idx: number, node: StoryNode, rect: DOMRect | null) => void;
  expanded?: boolean;
  animateFromRect?: DOMRect | null;
  showBack?: boolean;
  onBack?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [animStyle, setAnimStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (expanded && animateFromRect && cardRef.current) {
      const card = cardRef.current;
      const targetRect = card.getBoundingClientRect();

      const dx = animateFromRect.left - targetRect.left;
      const dy = animateFromRect.top - targetRect.top;
      const sx = animateFromRect.width / targetRect.width;
      const sy = animateFromRect.height / targetRect.height;

      setAnimStyle({
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        transition: "none",
      });

      requestAnimationFrame(() => {
        setAnimStyle({
          transform: "translate(0,0) scale(1,1)",
          transition:
            "transform 0.5s cubic-bezier(.23,1.02,.64,1), box-shadow 0.3s",
        });
      });
    } else {
      setAnimStyle({});
    }
  }, [expanded, animateFromRect]);

  return (
    <div
      ref={cardRef}
      className={`story-card${expanded ? " expanded" : ""}`}
      style={{
        ...animStyle,
        cursor: node.children && !expanded ? "pointer" : "default",
        zIndex: expanded ? 10 : 1,
        position: expanded ? "fixed" : "relative",
        top: expanded ? 0 : undefined,
        left: expanded ? 0 : undefined,
        right: expanded ? 0 : undefined,
        bottom: expanded ? 0 : undefined,
        margin: expanded ? "0 auto" : undefined,
      }}
      tabIndex={0}
      role="button"
      aria-pressed="false"
    >
      {showBack && (
        <button
          className="story-card-back"
          onClick={(e) => {
            e.stopPropagation();
            onBack?.();
          }}
        >
          ← Back
        </button>
      )}
      <div className="story-card-title">{node.title}</div>
      <div className="story-card-desc">{node.description}</div>
      <div className="story-card-bottom-bar" />
      {expanded && node.children && (
        <div
          className="story-card-children"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "stretch",
            gap: "3vw",
            marginTop: "2vw",
            width: "100%",
            height: "100%",
            zIndex: 5,
            position: "relative",
          }}
        >
          {node.children.map((child, idx) => (
            <StoryCardChild
              key={child.id}
              node={child}
              onSelect={onSelect}
              idx={idx}
            />
          ))}
        </div>
      )}
      {!node.children && expanded && (
        <div className="story-card-end">
          The End.{" "}
          <button className="story-card-restart" onClick={onBack}>
            Restart
          </button>
        </div>
      )}
      <style>{`
        .story-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 4px solid #d4af37;
          border-radius: 24px;
          background: linear-gradient(135deg, #f8e7b6 0%, #e2c275 100%);
          box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.09);
          min-width: 16vw;
          max-width: 22vw;
          min-height: 38vh;
          max-height: 60vh;
          height: 48vh;
          width: 18vw;
          padding: 3vw 2vw 2vw 2vw;
          margin: 0 2vw;
          font-family: 'Cinzel', serif;
          font-weight: 500;
          user-select: none;
          outline: none;
          transition:
            box-shadow 0.2s,
            transform 0.35s cubic-bezier(.23,1.02,.64,1),
            width 0.5s cubic-bezier(.23,1.02,.64,1),
            height 0.5s cubic-bezier(.23,1.02,.64,1),
            min-width 0.5s cubic-bezier(.23,1.02,.64,1),
            min-height 0.5s cubic-bezier(.23,1.02,.64,1),
            max-width 0.5s cubic-bezier(.23,1.02,.64,1),
            max-height 0.5s cubic-bezier(.23,1.02,.64,1),
            background 0.5s;
          position: relative;
          overflow: hidden;
        }
        .story-card:not(.expanded):hover {
          transform: scale(1.06) rotate(-1deg);
          box-shadow: 0 16px 48px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.13);
        }
        .story-card.expanded {
          min-width: 40vw;
          max-width: 60vw;
          min-height: 60vh;
          max-height: 80vh;
          height: 70vh;
          width: 50vw;
          margin: 0;
          padding: 4vw 4vw 3vw 4vw;
          background: linear-gradient(135deg, #fffbe6 0%, #ffe9a7 100%);
          box-shadow: 0 24px 64px 0 rgba(0,0,0,0.22), 0 8px 32px 0 rgba(0,0,0,0.13);
        }
        .story-card-title {
          font-size: 2vw;
          font-weight: 700;
          color: #6b4f1d;
          margin-bottom: 1vw;
          text-align: center;
          text-shadow: 0 2px 4px #fff8, 0 1px 0 #fff;
        }
        .story-card.expanded .story-card-title {
          font-size: 2.8vw;
          margin-bottom: 2vw;
        }
        .story-card-desc {
          font-size: 1.2vw;
          color: #3d2c0f;
          margin-bottom: 1.2vw;
          text-align: center;
          min-height: 5vh;
        }
        .story-card.expanded .story-card-desc {
          font-size: 1.5vw;
          margin-bottom: 2vw;
          min-height: 8vh;
        }
        .story-card-bottom-bar {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 18px;
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 18px;
          background: linear-gradient(90deg, #e2c275 0%, #f8e7b6 50%, #e2c275 100%);
        }
        .story-card-back {
          position: absolute;
          top: 24px;
          left: 24px;
          font-size: 1.2vw;
          padding: 0.6vw 2vw;
          border-radius: 8px;
          border: 2px solid #bfa14a;
          background: #f8e7b6;
          color: #7a5c1c;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px #e2c27555;
          z-index: 20;
          transition: background 0.2s;
        }
        .story-card-back:hover {
          background: #ffe9a7;
        }
        .story-card-end {
          margin-top: 3vw;
          font-weight: 600;
          font-size: 1.5vw;
        }
        .story-card-restart {
          margin-left: 1vw;
          font-size: 1.2vw;
          padding: 0.6vw 2vw;
          border-radius: 8px;
          border: 2px solid #bfa14a;
          background: #f8e7b6;
          color: #7a5c1c;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px #e2c27555;
          transition: background 0.2s;
        }
        .story-card-restart:hover {
          background: #ffe9a7;
        }
        .story-card.expanded .story-card-children {
          animation: fadein 0.5s;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}

function StoryCardChild({
  node,
  onSelect,
  idx,
}: {
  node: StoryNode;
  onSelect: (idx: number, node: StoryNode, rect: DOMRect | null) => void;
  idx: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={ref}
      style={{ display: "flex", flex: 1, justifyContent: "center" }}
      onClick={(e) => {
        e.stopPropagation();
        if (ref.current) {
          onSelect(idx, node, ref.current.getBoundingClientRect());
        }
      }}
    >
      <StoryCard node={node} onSelect={() => {}} />
    </div>
  );
}

export default function StoryCardDemo() {
  const [path, setPath] = useState<{ node: StoryNode; rect: DOMRect | null }[]>(
    []
  );

  const handleSelect = (idx: number, node: StoryNode, rect: DOMRect | null) => {
    setPath((prev) => [...prev, { node, rect }]);
  };

  const handleBack = () => {
    setPath((prev) => prev.slice(0, -1));
  };

  const handleRestart = () => {
    setPath([]);
  };

  const current =
    path.length === 0
      ? { node: STORY_TREE[0], rect: null }
      : path[path.length - 1];

  return (
    <div
      style={{
        padding: "4vw 6vw 4vw 6vw",
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse at center, #f7ecd0 0%, #e2c275 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <StoryCard
        node={current.node}
        expanded
        animateFromRect={current.rect}
        showBack={path.length > 0}
        onBack={path.length === 1 ? handleRestart : handleBack}
        onSelect={handleSelect}
      />
    </div>
  );
}
