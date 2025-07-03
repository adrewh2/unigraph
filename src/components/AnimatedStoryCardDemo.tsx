import React, { useLayoutEffect, useRef, useState } from "react";

interface StoryNode {
  id: string;
  title: string;
  description: string;
  children?: StoryNode[];
}

const STORY_TREE: StoryNode = {
  id: "root",
  title: "Choose Your Adventure",
  description: "Pick a story to begin your journey.",
  children: [
    {
      id: "artifact",
      title: "The Lost Artifact",
      description:
        "You hear rumors of a powerful artifact hidden in ancient ruins.",
      children: [
        {
          id: "artifact-1",
          title: "Enter the Ruins",
          description: "You step into the dark, echoing halls of the ruins.",
        },
        {
          id: "artifact-2",
          title: "Seek a Guide",
          description: "You look for a local guide to help you navigate.",
        },
        {
          id: "artifact-3",
          title: "Research in the Library",
          description: "You search ancient tomes for clues.",
        },
      ],
    },
    {
      id: "village",
      title: "The Vanished Village",
      description: "A whole village has disappeared overnight.",
      children: [
        {
          id: "village-1",
          title: "Investigate the Site",
          description: "You visit the empty village to search for clues.",
        },
        {
          id: "village-2",
          title: "Consult the Elders",
          description: "The village elders may know more.",
        },
        {
          id: "village-3",
          title: "Search for Survivors",
          description: "You look for anyone who might have escaped.",
        },
      ],
    },
    {
      id: "forest",
      title: "The Cursed Forest",
      description: "Travelers avoid the forest, claiming it's cursed.",
      children: [
        {
          id: "forest-1",
          title: "Enter the Forest",
          description: "You brave the dark woods despite the warnings.",
        },
        {
          id: "forest-2",
          title: "Ask the Hermit",
          description: "A hermit claims to know the forest's secrets.",
        },
        {
          id: "forest-3",
          title: "Circle the Perimeter",
          description: "You walk the edge of the forest, looking for clues.",
        },
      ],
    },
  ],
};

type CardRect = {
  left: number;
  top: number;
  width: number;
  height: number;
} | null;

function getRect(el: HTMLElement | null): CardRect {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function AnimatedStoryCard({
  node,
  isParent,
  onChildSelect,
  animateFrom,
  showBack,
  onBack,
  visible = true,
}: {
  node: StoryNode;
  isParent: boolean;
  onChildSelect: (child: StoryNode, rect: CardRect) => void;
  animateFrom?: CardRect;
  showBack?: boolean;
  onBack?: () => void;
  visible?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [animStyle, setAnimStyle] = useState<React.CSSProperties>({});
  const [opacity, setOpacity] = useState(visible ? 1 : 0);

  // Animate card from previous child position to parent position
  useLayoutEffect(() => {
    if (isParent && animateFrom && cardRef.current) {
      const card = cardRef.current;
      const targetRect = card.getBoundingClientRect();
      const dx = animateFrom.left - targetRect.left;
      const dy = animateFrom.top - targetRect.top;
      const sx = animateFrom.width / targetRect.width;
      const sy = animateFrom.height / targetRect.height;

      setAnimStyle({
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        opacity: 0.5,
        transition: "none",
      });

      requestAnimationFrame(() => {
        setAnimStyle({
          transform: "translate(0,0) scale(1,1)",
          opacity: 1,
          transition:
            "transform 0.5s cubic-bezier(.23,1.02,.64,1), opacity 0.5s cubic-bezier(.23,1.02,.64,1), box-shadow 0.3s",
        });
      });
    } else {
      setAnimStyle({
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s cubic-bezier(.23,1.02,.64,1)",
      });
    }
  }, [isParent, animateFrom, visible]);

  // Fade out when visible changes to false
  useLayoutEffect(() => {
    if (!visible) {
      setAnimStyle((prev) => ({
        ...prev,
        opacity: 0,
        transition:
          (prev.transition ? prev.transition + ", " : "") +
          "opacity 0.5s cubic-bezier(.23,1.02,.64,1)",
      }));
    }
  }, [visible]);

  return (
    <div
      ref={cardRef}
      className={`animated-story-card${isParent ? " parent" : " child"}`}
      style={{
        ...animStyle,
        pointerEvents: visible ? undefined : "none",
        position: isParent ? "relative" : "relative",
        zIndex: isParent ? 10 : 1,
      }}
    >
      {showBack && (
        <button
          className="animated-story-card-back"
          onClick={(e) => {
            e.stopPropagation();
            onBack?.();
          }}
        >
          ← Back
        </button>
      )}
      <div className="animated-story-card-title">{node.title}</div>
      <div className="animated-story-card-desc">{node.description}</div>
      {isParent && node.children && (
        <div className="animated-story-card-children">
          {node.children.map((child, idx) => (
            <AnimatedStoryCardChild
              key={child.id}
              node={child}
              onSelect={onChildSelect}
            />
          ))}
        </div>
      )}
      {!node.children && isParent && (
        <div className="animated-story-card-end">
          The End.{" "}
          <button className="animated-story-card-restart" onClick={onBack}>
            Restart
          </button>
        </div>
      )}
      <style>{`
        .animated-story-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 4px solid #d4af37;
          border-radius: 24px;
          background: linear-gradient(135deg, #f8e7b6 0%, #e2c275 100%);
          box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.09);
          font-family: 'Cinzel', serif;
          font-weight: 500;
          user-select: none;
          outline: none;
          transition:
            box-shadow 0.2s,
            transform 0.5s cubic-bezier(.23,1.02,.64,1),
            width 0.5s cubic-bezier(.23,1.02,.64,1),
            height 0.5s cubic-bezier(.23,1.02,.64,1),
            background 0.5s;
          position: relative;
          overflow: hidden;
        }
        .animated-story-card.parent {
          width: 70vw;
          min-width: 60vw;
          max-width: 80vw;
          height: 70vh;
          min-height: 60vh;
          max-height: 80vh;
          padding: 4vw 4vw 3vw 4vw;
          margin: 0 auto;
          background: linear-gradient(135deg, #fffbe6 0%, #ffe9a7 100%);
          box-shadow: 0 24px 64px 0 rgba(0,0,0,0.22), 0 8px 32px 0 rgba(0,0,0,0.13);
        }
        .animated-story-card.child {
          width: 16vw;
          min-width: 12vw;
          max-width: 18vw;
          height: 36vh;
          min-height: 28vh;
          max-height: 40vh;
          padding: 2vw 1.2vw 1.2vw 1.2vw;
          margin: 0 1.5vw;
          background: linear-gradient(135deg, #f8e7b6 0%, #e2c275 100%);
          box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.09);
          cursor: pointer;
        }
        .animated-story-card.child:hover {
          transform: scale(1.06) rotate(-1deg);
          box-shadow: 0 16px 48px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.13);
        }
        .animated-story-card-title {
          font-size: 2vw;
          font-weight: 700;
          color: #6b4f1d;
          margin-bottom: 1vw;
          text-align: center;
          text-shadow: 0 2px 4px #fff8, 0 1px 0 #fff;
        }
        .animated-story-card.parent .animated-story-card-title {
          font-size: 2.8vw;
          margin-bottom: 2vw;
        }
        .animated-story-card-desc {
          font-size: 1.2vw;
          color: #3d2c0f;
          margin-bottom: 1.2vw;
          text-align: center;
          min-height: 5vh;
        }
        .animated-story-card.parent .animated-story-card-desc {
          font-size: 1.5vw;
          margin-bottom: 2vw;
          min-height: 8vh;
        }
        .animated-story-card-children {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: stretch;
          gap: 2vw;
          margin-top: 2vw;
          width: 100%;
          height: 100%;
          z-index: 5;
          position: relative;
          animation: fadein 0.5s;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animated-story-card-back {
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
        .animated-story-card-back:hover {
          background: #ffe9a7;
        }
        .animated-story-card-end {
          margin-top: 3vw;
          font-weight: 600;
          font-size: 1.5vw;
        }
        .animated-story-card-restart {
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
        .animated-story-card-restart:hover {
          background: #ffe9a7;
        }
      `}</style>
    </div>
  );
}

function AnimatedStoryCardChild({
  node,
  onSelect,
}: {
  node: StoryNode;
  onSelect: (child: StoryNode, rect: CardRect) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={ref}
      style={{ display: "flex", flex: 1, justifyContent: "center" }}
      onClick={(e) => {
        e.stopPropagation();
        if (ref.current) {
          onSelect(node, getRect(ref.current));
        }
      }}
    >
      <AnimatedStoryCard
        node={node}
        isParent={false}
        onChildSelect={() => {}}
        visible={true}
      />
    </div>
  );
}

export default function AnimatedStoryCardDemo() {
  const [stack, setStack] = useState<
    { node: StoryNode; animateFrom: CardRect; visible: boolean }[]
  >([{ node: STORY_TREE, animateFrom: null, visible: true }]);

  const [transitioning, setTransitioning] = useState(false);

  const handleChildSelect = (child: StoryNode, rect: CardRect) => {
    setTransitioning(true);
    setStack((prev) => {
      // Fade out the current parent card
      const newStack = prev.map((item, idx) =>
        idx === prev.length - 1 ? { ...item, visible: false } : item
      );
      // Add the new parent card, initially invisible
      return [
        ...newStack,
        { node: child, animateFrom: rect, visible: false },
      ];
    });
    // After fade out, fade in the new parent card
    setTimeout(() => {
      setStack((prev) =>
        prev.map((item, idx) =>
          idx === prev.length - 1 ? { ...item, visible: true } : item
        )
      );
      setTimeout(() => setTransitioning(false), 500);
    }, 500);
  };

  const handleBack = () => {
    setTransitioning(true);
    setStack((prev) => {
      // Fade out the current parent card
      const newStack = prev.map((item, idx) =>
        idx === prev.length - 1 ? { ...item, visible: false } : item
      );
      return newStack;
    });
    setTimeout(() => {
      setStack((prev) => prev.slice(0, -1).map((item, idx, arr) =>
        idx === arr.length - 1 ? { ...item, visible: true } : item
      ));
      setTimeout(() => setTransitioning(false), 500);
    }, 500);
  };

  const handleRestart = () => {
    setStack([{ node: STORY_TREE, animateFrom: null, visible: true }]);
  };

  const current = stack[stack.length - 1];

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
      {stack.map((item, idx) =>
        idx === stack.length - 1 ? (
          <AnimatedStoryCard
            key={item.node.id + "-parent"}
            node={item.node}
            isParent={true}
            animateFrom={item.animateFrom}
            onChildSelect={handleChildSelect}
            showBack={stack.length > 1}
            onBack={stack.length === 2 ? handleRestart : handleBack}
            visible={item.visible}
          />
        ) : null
      )}
      {stack.length > 1 && (
        <AnimatedStoryCard
          key={stack[stack.length - 2].node.id + "-prev"}
          node={stack[stack.length - 2].node}
          isParent={true}
          animateFrom={stack[stack.length - 2].animateFrom}
          onChildSelect={handleChildSelect}
          showBack={stack.length > 2}
          onBack={stack.length === 3 ? handleRestart : handleBack}
          visible={stack[stack.length - 2].visible}
        />
      )}
    </div>
  );
}
