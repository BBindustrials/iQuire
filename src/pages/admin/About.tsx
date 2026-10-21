// ============================================================================
// iQuire — Admin: About Page Editor (Phase 14.13)
// ============================================================================

import React, { useEffect, useState } from 'react';
import { Input } from '../../components/common/Input';
import { FormSection } from '../../components/common/FormSection';
import { ImageField } from '../../components/common/ImageField';
import {
  fetchAboutContent,
  updateAboutSection,
  type AboutHeroContent,
  type AboutStoryContent,
  type AboutMissionVisionContent,
  type AboutCommitmentContent,
  type AboutFounderContent,
} from '../../services/about.service';
import styles from './About.module.css';

// ============================================================================
// Types
// ============================================================================

type Tab = 'hero' | 'story' | 'mission_vision' | 'commitment' | 'founder';

const TABS: { key: Tab; label: string }[] = [
  { key: 'hero', label: 'Hero' },
  { key: 'story', label: 'Our Story' },
  { key: 'mission_vision', label: 'Mission & Vision' },
  { key: 'commitment', label: 'Commitment' },
  { key: 'founder', label: 'Founder' },
];

// ============================================================================
// Component
// ============================================================================

export const AdminAbout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Section state
  const [hero, setHero] = useState<AboutHeroContent | null>(null);
  const [story, setStory] = useState<AboutStoryContent | null>(null);
  const [missionVision, setMissionVision] =
    useState<AboutMissionVisionContent | null>(null);
  const [commitment, setCommitment] =
    useState<AboutCommitmentContent | null>(null);
  const [founder, setFounder] = useState<AboutFounderContent | null>(null);

  // --------------------------------------------------------------------------
  // Load
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      const res = await fetchAboutContent();
      if (!isMounted) return;

      if (!res.success || !res.data) {
        setError(res.error ?? 'Failed to load About content');
        setIsLoading(false);
        return;
      }

      setHero(res.data.hero);
      setStory(res.data.story);
      setMissionVision(res.data.mission_vision);
      setCommitment(res.data.commitment);
      setFounder(res.data.founder);
      setIsLoading(false);
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Save helpers
  // --------------------------------------------------------------------------
  const showSaved = () => {
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const saveSection = async (
    section: string,
    content: Record<string, unknown>
  ) => {
    setIsSaving(true);
    setError(null);

    const res = await updateAboutSection(section, content);
    setIsSaving(false);

    if (!res.success) {
      setError(res.error ?? 'Failed to save');
      return;
    }

    showSaved();
  };

  const handleSaveHero = () => {
    if (!hero) return;
    saveSection('hero', hero as unknown as Record<string, unknown>);
  };

  const handleSaveStory = () => {
    if (!story) return;
    saveSection('story', story as unknown as Record<string, unknown>);
  };

  const handleSaveMissionVision = () => {
    if (!missionVision) return;
    saveSection(
      'mission_vision',
      missionVision as unknown as Record<string, unknown>
    );
  };

  const handleSaveCommitment = () => {
    if (!commitment) return;
    saveSection('commitment', commitment as unknown as Record<string, unknown>);
  };

  const handleSaveFounder = () => {
    if (!founder) return;
    saveSection('founder', founder as unknown as Record<string, unknown>);
  };

  // --------------------------------------------------------------------------
  // Render: loading
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading About content…</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>About Page</h1>
          <p className={styles.pageSubtitle}>
            Edit the content of your About Us page. Changes go live immediately
            after saving.
          </p>
        </div>
        {savedAt && <span className={styles.savedBadge}>✓ Saved</span>}
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button
            type="button"
            className={styles.errorClose}
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabsRow}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tab} ${
              activeTab === tab.key ? styles.tabActive : ''
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* ============ HERO ============ */}
        {activeTab === 'hero' && hero && (
          <FormSection title="Hero Section">
            <Input
              label="Badge"
              value={hero.badge}
              onChange={(e) => setHero({ ...hero, badge: e.target.value })}
              placeholder="About IQuire"
            />
            <div className={styles.twoCol}>
              <Input
                label="Title prefix"
                value={hero.title_prefix}
                onChange={(e) =>
                  setHero({ ...hero, title_prefix: e.target.value })
                }
                placeholder="Bridging the gap between "
              />
              <Input
                label="Title highlight"
                value={hero.title_highlight}
                onChange={(e) =>
                  setHero({ ...hero, title_highlight: e.target.value })
                }
                placeholder="potential and achievement."
              />
            </div>
            <div className={styles.textareaWrapper}>
              <label className={styles.textareaLabel}>Subtitle</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={hero.subtitle}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              />
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSaveHero}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save Hero'}
              </button>
            </div>
          </FormSection>
        )}

        {/* ============ STORY ============ */}
        {activeTab === 'story' && story && (
          <FormSection title="Our Story Section">
            <Input
              label="Badge"
              value={story.badge}
              onChange={(e) => setStory({ ...story, badge: e.target.value })}
            />
            <Input
              label="Title"
              value={story.title}
              onChange={(e) => setStory({ ...story, title: e.target.value })}
            />

            {/* ImageField replaces the old URL input */}
            <ImageField
              label="Story image"
              value={story.image_url}
              onChange={(url) => setStory({ ...story, image_url: url })}
              bucket="site-images"
              aspect="square"
              helperText="Upload an image or paste a direct image URL (ending in .jpg, .png, or .webp)."
            />

            <div className={styles.repeatList}>
              <div className={styles.repeatLabel}>
                Paragraphs ({story.paragraphs.length})
              </div>
              {story.paragraphs.map((p, i) => (
                <div key={i} className={styles.repeatItem}>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={p}
                    onChange={(e) => {
                      const next = [...story.paragraphs];
                      next[i] = e.target.value;
                      setStory({ ...story, paragraphs: next });
                    }}
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => {
                      const next = story.paragraphs.filter(
                        (_, idx) => idx !== i
                      );
                      setStory({ ...story, paragraphs: next });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={styles.addBtn}
                onClick={() =>
                  setStory({
                    ...story,
                    paragraphs: [...story.paragraphs, ''],
                  })
                }
              >
                + Add paragraph
              </button>
            </div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSaveStory}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save Story'}
              </button>
            </div>
          </FormSection>
        )}

        {/* ============ MISSION & VISION ============ */}
        {activeTab === 'mission_vision' && missionVision && (
          <FormSection title="Mission & Vision Section">
            <Input
              label="Badge"
              value={missionVision.badge}
              onChange={(e) =>
                setMissionVision({ ...missionVision, badge: e.target.value })
              }
            />
            <div className={styles.twoCol}>
              <Input
                label="Title prefix"
                value={missionVision.title_prefix}
                onChange={(e) =>
                  setMissionVision({
                    ...missionVision,
                    title_prefix: e.target.value,
                  })
                }
              />
              <Input
                label="Title highlight"
                value={missionVision.title_highlight}
                onChange={(e) =>
                  setMissionVision({
                    ...missionVision,
                    title_highlight: e.target.value,
                  })
                }
              />
            </div>

            {missionVision.cards.map((card, i) => (
              <div key={i} className={styles.cardBlock}>
                <div className={styles.cardBlockHeader}>Card {i + 1}</div>
                <div className={styles.twoCol}>
                  <Input
                    label="Icon"
                    value={card.icon}
                    onChange={(e) => {
                      const next = [...missionVision.cards];
                      next[i] = { ...next[i], icon: e.target.value };
                      setMissionVision({ ...missionVision, cards: next });
                    }}
                  />
                  <Input
                    label="Title"
                    value={card.title}
                    onChange={(e) => {
                      const next = [...missionVision.cards];
                      next[i] = { ...next[i], title: e.target.value };
                      setMissionVision({ ...missionVision, cards: next });
                    }}
                  />
                </div>
                {card.paragraphs.map((p, j) => (
                  <div key={j} className={styles.repeatItem}>
                    <textarea
                      className={styles.textarea}
                      rows={3}
                      value={p}
                      onChange={(e) => {
                        const nextCards = [...missionVision.cards];
                        const nextParas = [...nextCards[i].paragraphs];
                        nextParas[j] = e.target.value;
                        nextCards[i] = {
                          ...nextCards[i],
                          paragraphs: nextParas,
                        };
                        setMissionVision({
                          ...missionVision,
                          cards: nextCards,
                        });
                      }}
                    />
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => {
                        const nextCards = [...missionVision.cards];
                        nextCards[i] = {
                          ...nextCards[i],
                          paragraphs: nextCards[i].paragraphs.filter(
                            (_, idx) => idx !== j
                          ),
                        };
                        setMissionVision({
                          ...missionVision,
                          cards: nextCards,
                        });
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => {
                    const next = [...missionVision.cards];
                    next[i] = {
                      ...next[i],
                      paragraphs: [...next[i].paragraphs, ''],
                    };
                    setMissionVision({ ...missionVision, cards: next });
                  }}
                >
                  + Add paragraph
                </button>
              </div>
            ))}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSaveMissionVision}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save Mission & Vision'}
              </button>
            </div>
          </FormSection>
        )}

        {/* ============ COMMITMENT ============ */}
        {activeTab === 'commitment' && commitment && (
          <FormSection title="Our Commitment Section">
            <Input
              label="Badge"
              value={commitment.badge}
              onChange={(e) =>
                setCommitment({ ...commitment, badge: e.target.value })
              }
            />
            <Input
              label="Title"
              value={commitment.title}
              onChange={(e) =>
                setCommitment({ ...commitment, title: e.target.value })
              }
            />

            {commitment.cards.map((card, i) => (
              <div key={i} className={styles.cardBlock}>
                <div className={styles.cardBlockHeader}>Card {i + 1}</div>
                <div className={styles.twoCol}>
                  <Input
                    label="Number"
                    value={card.number}
                    onChange={(e) => {
                      const next = [...commitment.cards];
                      next[i] = { ...next[i], number: e.target.value };
                      setCommitment({ ...commitment, cards: next });
                    }}
                  />
                  <Input
                    label="Title"
                    value={card.title}
                    onChange={(e) => {
                      const next = [...commitment.cards];
                      next[i] = { ...next[i], title: e.target.value };
                      setCommitment({ ...commitment, cards: next });
                    }}
                  />
                </div>
                <div className={styles.textareaWrapper}>
                  <label className={styles.textareaLabel}>Text</label>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={card.text}
                    onChange={(e) => {
                      const next = [...commitment.cards];
                      next[i] = { ...next[i], text: e.target.value };
                      setCommitment({ ...commitment, cards: next });
                    }}
                  />
                </div>
              </div>
            ))}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSaveCommitment}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save Commitment'}
              </button>
            </div>
          </FormSection>
        )}

        {/* ============ FOUNDER ============ */}
        {activeTab === 'founder' && founder && (
          <FormSection title="Founder Section">
            <Input
              label="Badge"
              value={founder.badge}
              onChange={(e) =>
                setFounder({ ...founder, badge: e.target.value })
              }
            />
            <div className={styles.twoCol}>
              <Input
                label="Name"
                value={founder.name}
                onChange={(e) =>
                  setFounder({ ...founder, name: e.target.value })
                }
              />
              <Input
                label="Credentials"
                value={founder.credentials}
                onChange={(e) =>
                  setFounder({ ...founder, credentials: e.target.value })
                }
              />
            </div>
            <Input
              label="Roles"
              value={founder.roles}
              onChange={(e) =>
                setFounder({ ...founder, roles: e.target.value })
              }
            />

            {/* ImageField replaces the old Photo URL input */}
            <ImageField
              label="Founder photo"
              value={founder.photo_url}
              onChange={(url) => setFounder({ ...founder, photo_url: url })}
              bucket="site-images"
              aspect="square"
              helperText="Upload a photo or paste a direct image URL. Square crop works best."
            />

            <Input
              label="LinkedIn URL"
              value={founder.linkedin_url}
              onChange={(e) =>
                setFounder({ ...founder, linkedin_url: e.target.value })
              }
            />

            <div className={styles.repeatList}>
              <div className={styles.repeatLabel}>
                Bio paragraphs ({founder.bio_paragraphs.length})
              </div>
              {founder.bio_paragraphs.map((p, i) => (
                <div key={i} className={styles.repeatItem}>
                  <textarea
                    className={styles.textarea}
                    rows={4}
                    value={p}
                    onChange={(e) => {
                      const next = [...founder.bio_paragraphs];
                      next[i] = e.target.value;
                      setFounder({ ...founder, bio_paragraphs: next });
                    }}
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => {
                      const next = founder.bio_paragraphs.filter(
                        (_, idx) => idx !== i
                      );
                      setFounder({ ...founder, bio_paragraphs: next });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={styles.addBtn}
                onClick={() =>
                  setFounder({
                    ...founder,
                    bio_paragraphs: [...founder.bio_paragraphs, ''],
                  })
                }
              >
                + Add paragraph
              </button>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleSaveFounder}
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save Founder'}
              </button>
            </div>
          </FormSection>
        )}
      </div>
    </div>
  );
};