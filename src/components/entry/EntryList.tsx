import { useUser } from "../../contexts/UserContext";
import { IEntry } from "../../types";
import { Entry } from "./";

interface EntryListProps {
  entries: IEntry[];
}

export const EntryList: React.FC<EntryListProps> = ({ entries }) => {
  const { user } = useUser();

  return (
    <div className="space-y-4 w-full">
      {entries.map((entry, index) => (
        <Entry
          key={entry.id}
          entry={entry}
          isOld={entry.version !== 3}
          viewedBy={user!.role}
        />
      ))}
    </div>
  );
};
