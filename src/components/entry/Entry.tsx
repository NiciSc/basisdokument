import cx from "classnames";
import {
  ArrowBendLeftUp,
  BookmarkSimple,
  DotsThree,
  Notepad,
  Pencil,
  Scales,
  Trash,
} from "phosphor-react";
import React, { useEffect, useState } from "react";
import { Action, EntryBody, EntryForm, EntryHeader, NewEntry } from ".";
import { useCase, useHeaderContext } from "../../contexts";
import { IEntry, UserRole } from "../../types";
import { Button } from "../Button";
import { ErrorPopup } from "../ErrorPopup";
import { Tooltip } from "../Tooltip";
import { EntryList } from "./EntryList";
import { LitigiousCheck } from "./LitigiousCheck";

interface EntryProps {
  entry: IEntry;
  isBookmarked?: boolean;
  viewedBy: UserRole;
  isHidden?: boolean;
  isOld?: boolean;
  isHighlighted?: boolean;
}

export const Entry: React.FC<EntryProps> = ({
  entry,
  viewedBy,
  isBookmarked = false,
  isHidden = false,
  isOld = false,
  isHighlighted = false,
}) => {
  // Threaded entries
  const { groupedEntries, setEntries } = useCase();
  const { showColumnView } = useHeaderContext();

  const thread = groupedEntries[entry.sectionId][entry.id];

  // State of current entry
  const [isBodyOpen, setIsBodyOpen] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isNewEntryVisible, setIsNewEntryVisible] = useState<boolean>(false);
  const [isLitigious, setIsLitigious] = useState<boolean | null>(null);
  const [isErrorVisible, setIsErrorVisible] = useState<boolean>(false);

  const isJudge = viewedBy === UserRole.Judge;
  const isPlaintiff = entry.role === UserRole.Plaintiff;
  const isOwnEntry =
    (viewedBy === UserRole.Plaintiff && entry.role === "Kläger") ||
    (viewedBy === UserRole.Defendant && entry.role === "Beklagter");
  const canAddEntry = isJudge || !isOwnEntry;

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    document.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    });

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [isMenuOpen]);

  const toggleBody = (e: React.MouseEvent) => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }
    setIsEditing(false);
    setIsBodyOpen(!isBodyOpen);
  };

  const showNewEntry = () => {
    setIsNewEntryVisible(true);
  };

  const bookmarkEntry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
  };

  const addNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const editEntry = (e: React.MouseEvent) => {
    setIsEditing(!isEditing);
    setIsBodyOpen(true);
  };

  const deleteEntry = (entryId: string) => {
    setEntries((prevEntries) =>
      prevEntries.filter((entry) => entry.id !== entryId)
    );
  };

  const updateEntry = (text: string) => {
    setIsEditing(false);
    setEntries((oldEntries) => {
      const newEntries = [...oldEntries];
      const entryIndex = newEntries.findIndex(
        (newEntry) => newEntry.id === entry.id
      );
      newEntries[entryIndex].text = text;
      return newEntries;
    });
  };

  const addHint = () => {};

  return (
    <>
      <div
        id={entry.entryCode}
        className={cx("text-sm", {
          "opacity-50": isHidden,
          "pointer-events-none": isHidden,
        })}
      >
        <div
          className={cx("flex flex-col", {
            "items-end": !isPlaintiff,
          })}
        >
          <div
            className={cx("transition-all", {
              "w-[calc(50%_-_12px)]": !isExpanded && showColumnView,
              "w-full": isExpanded || !showColumnView,
            })}
          >
            {/* Entry */}
            <div
              className={cx("shadow rounded-lg bg-white relative", {
                "outline outline-2 outline-offset-4 outline-blue-600":
                  isHighlighted,
              })}
            >
              {isJudge && (
                <LitigiousCheck
                  isLitigious={isLitigious}
                  setIsLitigious={setIsLitigious}
                />
              )}
              <EntryHeader
                isPlaintiff={isPlaintiff}
                isBodyOpen={isBodyOpen}
                toggleBody={toggleBody}
              >
                <div className="overflow-auto max-w-[350px] whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={cx(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        {
                          "bg-darkPurple text-lightPurple": isPlaintiff,
                          "bg-darkPetrol text-lightPetrol": !isPlaintiff,
                        }
                      )}
                    >
                      {entry.entryCode}
                    </span>
                    <span className="font-bold">{entry.author}</span>
                    <span>25.08.2022</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Tooltip text="Zu Lesezeichen hinzufügen">
                    <Action onClick={bookmarkEntry} isPlaintiff={isPlaintiff}>
                      <BookmarkSimple
                        size={20}
                        weight={isBookmarked ? "fill" : "regular"}
                      />
                    </Action>
                  </Tooltip>
                  <Tooltip text="Notiz hinzufügen">
                    <Action onClick={addNote} isPlaintiff={isPlaintiff}>
                      <Notepad size={20} />
                    </Action>
                  </Tooltip>
                  {(isJudge || (entry.role === viewedBy && !isOld)) && (
                    <Tooltip text="Mehr Optionen">
                      <Action
                        className={cx("relative", {
                          "bg-darkPurple text-lightPurple":
                            isPlaintiff && isMenuOpen,
                          "bg-darkPetrol text-lightPetrol":
                            !isPlaintiff && isMenuOpen,
                        })}
                        onClick={toggleMenu}
                        isPlaintiff={isPlaintiff}
                      >
                        <DotsThree size={20} />
                        {isMenuOpen ? (
                          <ul className="absolute right-0 top-full p-2 bg-white text-darkGrey rounded-xl min-w-[250px] shadow-lg z-50">
                            {isJudge && (
                              <li
                                tabIndex={0}
                                onClick={addHint}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-offWhite focus:bg-offWhite focus:outline-none"
                              >
                                <Scales size={20} />
                                Hinweis hinzufügen
                              </li>
                            )}
                            {!isOld && (
                              <>
                                <li
                                  tabIndex={0}
                                  onClick={editEntry}
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-offWhite focus:bg-offWhite focus:outline-none"
                                >
                                  <Pencil size={20} />
                                  Bearbeiten
                                </li>
                                <li
                                  tabIndex={0}
                                  onClick={() => deleteEntry(entry.id)}
                                  className="flex items-center gap-2 p-2 rounded-lg text-vibrantRed hover:bg-offWhite focus:bg-offWhite focus:outline-none"
                                >
                                  <Trash size={20} />
                                  Löschen
                                </li>
                              </>
                            )}
                          </ul>
                        ) : null}
                      </Action>
                    </Tooltip>
                  )}
                </div>
              </EntryHeader>
              {/* Body */}
              {isBodyOpen && !isEditing && (
                <EntryBody isPlaintiff={isPlaintiff}>{entry.text}</EntryBody>
              )}
              {isBodyOpen && isEditing && (
                <EntryForm
                  defaultContent={entry.text}
                  isPlaintiff={isPlaintiff}
                  isExpanded={isExpanded}
                  setIsExpanded={() => setIsExpanded(!isExpanded)}
                  onAbort={() => {
                    setIsErrorVisible(true);
                  }}
                  onSave={(_: string, rawHtml: string) => {
                    updateEntry(rawHtml);
                    setIsExpanded(false);
                  }}
                />
              )}
            </div>
            {/* Button to add response */}
            {canAddEntry && !isNewEntryVisible && (
              <Button
                onClick={showNewEntry}
                icon={<ArrowBendLeftUp weight="bold" size={18} />}
                size="sm"
                bgColor="transparent"
                textColor={cx("font-bold", {
                  "text-darkPurple": isPlaintiff,
                  "text-darkPetrol": !isPlaintiff,
                })}
              >
                Text verfassen
              </Button>
            )}
          </div>
          {isNewEntryVisible && (
            <div className={cx("flex flex-col w-full")}>
              {!showColumnView && (
                <button className="ml-5 w-5 border-l-2 border-lightGrey"></button>
              )}
              <NewEntry
                roleForNewEntry={
                  entry.role === UserRole.Plaintiff
                    ? UserRole.Defendant
                    : UserRole.Plaintiff
                }
                sectionId={entry.sectionId}
                associatedEntry={entry.id}
                setIsNewEntryVisible={setIsNewEntryVisible}
              />
            </div>
          )}
        </div>
      </div>
      {thread?.length > 0 && (
        <div
          className={cx({
            flex: !showColumnView,
          })}
        >
          {!showColumnView && (
            <button className="ml-5 w-5 border-l-2 border-lightGrey"></button>
          )}
          <EntryList entries={thread} />
        </div>
      )}
      <ErrorPopup isVisible={isErrorVisible}>
        <div className="flex flex-col items-center justify-center space-y-8">
          <p className="text-center text-base">
            Sind Sie sicher, dass Sie Ihre Änderungen verwerfen und somit{" "}
            <strong>nicht</strong> speichern möchten?
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              bgColor="bg-lightGrey"
              textColor="text-mediumGrey font-bold"
              onClick={() => {
                setIsErrorVisible(false);
              }}
            >
              Abbrechen
            </Button>
            <Button
              bgColor="bg-lightRed"
              textColor="text-darkRed font-bold"
              onClick={() => {
                setIsErrorVisible(false);
                setIsNewEntryVisible(false);
                setIsEditing(false);
              }}
            >
              Verwerfen
            </Button>
          </div>
        </div>
      </ErrorPopup>
    </>
  );
};
