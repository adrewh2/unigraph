import React, { useState } from "react";
import "./HearthstoneDraftDemo.css";

interface StoryNode {
  id: string;
  title: string;
  description: string;
  children?: StoryNode[];
}

// Sample story tree
const STORY_TREE: StoryNode = {
  id: "start",
  title: "The Beginning of Your Journey",
  description: "You stand at a crossroads, uncertain of which path to take...",
  children: [
    {
      id: "forest",
      title: "The Enchanted Forest",
      description:
        "A path leads into a mysterious forest filled with ancient magic.",
      children: [
        {
          id: "forest-fairy",
          title: "Meet the Fairy Queen",
          description:
            "You encounter a gathering of luminous beings led by their ethereal queen.",
          children: [
            {
              id: "forest-fairy-help",
              title: "Offer Your Help",
              description:
                "You pledge to assist the fairy folk with their mysterious ritual.",
            },
            {
              id: "forest-fairy-learn",
              title: "Learn Their Magic",
              description:
                "You ask to be taught the ancient ways of fairy magic.",
            },
            {
              id: "forest-fairy-leave",
              title: "Respectfully Decline",
              description:
                "You thank them for their hospitality but continue your journey elsewhere.",
            },
          ],
        },
        {
          id: "forest-cottage",
          title: "The Witch's Cottage",
          description:
            "You discover a quaint cottage with herbs hanging from the eaves and a garden of unusual plants.",
          children: [
            {
              id: "forest-cottage-knock",
              title: "Knock on the Door",
              description:
                "You decide to see if anyone is home and might offer guidance.",
            },
            {
              id: "forest-cottage-garden",
              title: "Explore the Garden",
              description:
                "The strange plants in the garden seem to call to you.",
            },
            {
              id: "forest-cottage-leave",
              title: "Pass By",
              description:
                "Something feels unsettling about this place. You continue on your way.",
            },
          ],
        },
        {
          id: "forest-river",
          title: "The Whispering River",
          description:
            "You come upon a river whose waters seem to murmur secrets of the forest.",
          children: [
            {
              id: "forest-river-drink",
              title: "Drink the Water",
              description:
                "The crystal clear water is tempting, perhaps it holds special properties.",
            },
            {
              id: "forest-river-follow",
              title: "Follow Upstream",
              description: "You decide to follow the river to its source.",
            },
            {
              id: "forest-river-cross",
              title: "Cross to the Other Side",
              description:
                "You search for a way to cross the river and continue your journey.",
            },
          ],
        },
      ],
    },
    {
      id: "mountain",
      title: "The Towering Mountains",
      description: "Steep paths wind their way up into cloud-covered peaks.",
      children: [
        {
          id: "mountain-cave",
          title: "The Dragon's Cave",
          description:
            "You discover a massive cave entrance with ancient claw marks around its edges.",
          children: [
            {
              id: "mountain-cave-enter",
              title: "Enter Cautiously",
              description: "You steel your nerves and step into the darkness.",
            },
            {
              id: "mountain-cave-call",
              title: "Call Into the Cave",
              description:
                "You decide to announce your presence before entering.",
            },
            {
              id: "mountain-cave-avoid",
              title: "Find Another Route",
              description:
                "The signs of a dragon are too clear - you search for a safer path.",
            },
          ],
        },
        {
          id: "mountain-village",
          title: "The Sky Village",
          description:
            "You encounter a village built into the mountainside, with rope bridges connecting homes carved into the rock.",
          children: [
            {
              id: "mountain-village-stay",
              title: "Seek Lodging",
              description:
                "You're tired from your journey and could use a warm meal and bed.",
            },
            {
              id: "mountain-village-trade",
              title: "Trade for Supplies",
              description:
                "Your pack is light and these people might have goods you need.",
            },
            {
              id: "mountain-village-guide",
              title: "Request a Guide",
              description:
                "The mountain paths ahead look treacherous. Perhaps someone can guide you.",
            },
          ],
        },
        {
          id: "mountain-shrine",
          title: "The Ancient Shrine",
          description:
            "You discover a weathered shrine dedicated to forgotten gods of the mountain.",
          children: [
            {
              id: "mountain-shrine-pray",
              title: "Offer a Prayer",
              description:
                "Though you don't know these gods, it seems respectful to acknowledge them.",
            },
            {
              id: "mountain-shrine-study",
              title: "Study the Carvings",
              description:
                "The shrine is covered in intricate carvings that might hold knowledge.",
            },
            {
              id: "mountain-shrine-camp",
              title: "Camp Nearby",
              description:
                "The shrine offers shelter from the mountain winds. You decide to rest here.",
            },
          ],
        },
      ],
    },
    {
      id: "coast",
      title: "The Misty Coastline",
      description:
        "Salt-laden air and the distant cry of gulls guide you toward the sea.",
      children: [
        {
          id: "coast-port",
          title: "The Bustling Harbor",
          description:
            "You find yourself in a busy port town, full of traders from distant lands.",
          children: [
            {
              id: "coast-port-ship",
              title: "Book Passage on a Ship",
              description: "Perhaps your destiny lies across the sea.",
            },
            {
              id: "coast-port-tavern",
              title: "Visit the Sailor's Tavern",
              description:
                "Where better to hear tales of adventure and opportunity?",
            },
            {
              id: "coast-port-market",
              title: "Explore the Market",
              description:
                "Exotic goods from across the world are bought and sold here.",
            },
          ],
        },
        {
          id: "coast-lighthouse",
          title: "The Lonely Lighthouse",
          description:
            "A tall lighthouse stands on a rocky outcropping, its beam sweeping across the foggy waters.",
          children: [
            {
              id: "coast-lighthouse-keeper",
              title: "Meet the Keeper",
              description:
                "Someone maintains this lighthouse. Perhaps they have stories to tell.",
            },
            {
              id: "coast-lighthouse-climb",
              title: "Climb to the Top",
              description: "The view from the top must be spectacular.",
            },
            {
              id: "coast-lighthouse-search",
              title: "Search the Shoreline",
              description:
                "The rocks below the lighthouse might hide treasures from shipwrecks.",
            },
          ],
        },
        {
          id: "coast-cove",
          title: "The Hidden Cove",
          description:
            "You discover a secluded cove, sheltered from prying eyes and the worst of the sea's fury.",
          children: [
            {
              id: "coast-cove-swim",
              title: "Swim in the Clear Waters",
              description:
                "The protected waters look invitingly calm and clear.",
            },
            {
              id: "coast-cove-cave",
              title: "Explore the Sea Cave",
              description:
                "A dark opening in the cliff face suggests there might be more to discover.",
            },
            {
              id: "coast-cove-boat",
              title: "Investigate the Abandoned Boat",
              description:
                "A small boat has been pulled up on the shore. Who left it here?",
            },
          ],
        },
      ],
    },
  ],
};

const HearthstoneDraftDemo: React.FC = () => {
  const [currentNode, setCurrentNode] = useState<StoryNode>(STORY_TREE);
  const [path, setPath] = useState<StoryNode[]>([STORY_TREE]);
  const [transitioning, setTransitioning] = useState(false);

  const handleSelectCard = (child: StoryNode) => {
    if (transitioning) return;

    setTransitioning(true);

    // Add short delay for transition effect
    setTimeout(() => {
      setCurrentNode(child);
      setPath([...path, child]);
      setTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    if (transitioning || path.length <= 1) return;

    setTransitioning(true);

    setTimeout(() => {
      const newPath = [...path];
      newPath.pop();
      setCurrentNode(newPath[newPath.length - 1]);
      setPath(newPath);
      setTransitioning(false);
    }, 300);
  };

  const handleRestart = () => {
    setTransitioning(true);

    setTimeout(() => {
      setCurrentNode(STORY_TREE);
      setPath([STORY_TREE]);
      setTransitioning(false);
    }, 300);
  };

  return (
    <div className="story-navigator-container">
      <div className="story-path">
        {path.map((node, index) => (
          <span key={node.id} className="path-item">
            {index > 0 && <span className="path-separator">›</span>}
            <span
              className="path-node"
              onClick={() => {
                if (index < path.length - 1) {
                  setTransitioning(true);
                  setTimeout(() => {
                    setCurrentNode(node);
                    setPath(path.slice(0, index + 1));
                    setTransitioning(false);
                  }, 300);
                }
              }}
            >
              {node.title}
            </span>
          </span>
        ))}
      </div>

      <div
        className={`parent-card-container ${transitioning ? "transitioning" : ""}`}
      >
        <div className="parent-card">
          <div className="parent-card-header">
            {path.length > 1 && (
              <button className="back-button" onClick={handleBack}>
                ← Back
              </button>
            )}
            <h2 className="parent-card-title">{currentNode.title}</h2>
            {path.length > 1 && path.length < 3 && (
              <button className="restart-button" onClick={handleRestart}>
                Start Over
              </button>
            )}
          </div>

          <p className="parent-card-description">{currentNode.description}</p>

          {currentNode.children ? (
            <div className="child-cards-container">
              {currentNode.children.map((child) => (
                <div
                  key={child.id}
                  className="child-card"
                  onClick={() => handleSelectCard(child)}
                >
                  <h3 className="child-card-title">{child.title}</h3>
                  <p className="child-card-description">{child.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="story-ending">
              <p>You have reached the end of this branch of your story.</p>
              <button className="restart-button" onClick={handleRestart}>
                Start a New Journey
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HearthstoneDraftDemo;
