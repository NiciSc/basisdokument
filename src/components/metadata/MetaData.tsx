import cx from "classnames";
import { CaretDown, CaretUp, DotsThree, Pencil } from "phosphor-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { useCase, useUser } from "../../contexts";
import { useOutsideClick } from "../../hooks/use-outside-click";
import { UserRole } from "../../types";
import { Button } from "../Button";
import { Action } from "../entry";
import { ErrorPopup } from "../ErrorPopup";
import { Tooltip } from "../Tooltip";
import { MetaDataBody } from "./MetaDataBody";
import { MetaDataForm } from "./MetaDataForm";

interface MetaDataProps {
  owner: UserRole;
}

export const MetaData: React.FC<MetaDataProps> = ({ owner }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditErrorVisible, setIsEditErrorVisible] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isBodyOpen, setIsBodyOpen] = useState<boolean>(true);
  const { user } = useUser();
  const { metaData, setMetaData } = useCase();
  const menuRef = useRef(null);
  useOutsideClick(menuRef, () => setIsMenuOpen(false));

  const isPlaintiff = owner === UserRole.Plaintiff;
  const isJudge = user?.role === UserRole.Judge;
  const content = isPlaintiff ? metaData?.plaintiff : metaData?.defendant;

  console.log("MetaData", metaData);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMetaData = () => {
    setIsBodyOpen(!isBodyOpen);
    setIsEditing(false);
  };

  const editMetaData = () => {
    setIsEditing(!isEditing);
    setIsMenuOpen(false);
  };

  const updateMetaData = (plainText: string, rawHtml: string) => {
    if (plainText.length === 0) {
      toast("Bitte geben sie einen Text ein.", { type: "error" });
      return;
    }

    setMetaData((prevState) => {
      const newState = { ...prevState };
      if (isPlaintiff) {
        newState.plaintiff = rawHtml;
      } else {
        newState.defendant = rawHtml;
      }
      return newState;
    });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-2">
        <Button
          position="end"
          bgColor={cx({
            "bg-lightPurple": isPlaintiff,
            "bg-lightPetrol": !isPlaintiff,
          })}
          textColor={cx("font-bold text-sm uppercase tracking-wider", {
            "text-darkPurple": isPlaintiff,
            "text-darkPetrol": !isPlaintiff,
          })}
          size="sm"
          onClick={toggleMetaData}
          icon={
            isBodyOpen ? (
              <CaretUp size={14} weight="bold" />
            ) : (
              <CaretDown size={14} weight="bold" />
            )
          }
        >
          {owner}
        </Button>
        {(isJudge || user?.role === owner) && (
          <div className="flex relative space-y-1 cursor-pointer">
            <Tooltip text="Mehr Optionen">
              <Action
                className={cx("relative", {
                  "bg-darkPurple text-lightPurple": isPlaintiff && isMenuOpen,
                  "bg-darkPetrol text-lightPetrol": !isPlaintiff && isMenuOpen,
                })}
                onClick={toggleMenu}
                isPlaintiff={isPlaintiff}
              >
                <DotsThree size={20} />
              </Action>
            </Tooltip>
            {isMenuOpen ? (
              <ul
                ref={menuRef}
                className="absolute right-0 top-full p-2 bg-white text-darkGrey rounded-xl min-w-[150px] shadow-lg z-50 text-sm"
              >
                <>
                  <li
                    tabIndex={0}
                    onClick={editMetaData}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-offWhite focus:bg-offWhite focus:outline-none"
                  >
                    <Pencil size={20} />
                    Bearbeiten
                  </li>
                </>
              </ul>
            ) : null}
          </div>
        )}
      </div>
      {isBodyOpen && (
        <div
          className={cx(
            "flex flex-col rounded-lg shadow text-sm overflow-hidden",
            {
              "bg-lightPurple text-darkPurple": isPlaintiff,
              "bg-lightPetrol text-darkPetrol": !isPlaintiff,
            }
          )}
        >
          {isEditing ? (
            <MetaDataForm
              isPlaintiff={isPlaintiff}
              defaultContent={content}
              onAbort={(plainText, rawHtml) => {
                setIsEditing(false);
              }}
              onSave={(plainText, rawHtml) => {
                updateMetaData(plainText, rawHtml);
              }}
            />
          ) : (
            <MetaDataBody isPlaintiff={isPlaintiff}>
              {isPlaintiff ? metaData?.plaintiff : metaData?.defendant}
            </MetaDataBody>
          )}
          <ErrorPopup isVisible={isEditErrorVisible}>
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
                    setIsEditErrorVisible(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  bgColor="bg-lightRed"
                  textColor="text-darkRed font-bold"
                  onClick={() => {
                    setIsEditErrorVisible(false);
                    setIsEditing(false);
                  }}
                >
                  Verwerfen
                </Button>
              </div>
            </div>
          </ErrorPopup>
        </div>
      )}
    </div>
  );
};
