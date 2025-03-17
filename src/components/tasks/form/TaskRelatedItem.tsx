
import { useState, useEffect } from "react";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormData } from "./types";
import { mockOpportunitiesAPI, mockDealsAPI } from "@/services/mockCrmService";

interface TaskRelatedItemProps {
  watch: UseFormWatch<FormData>;
  setValue: UseFormSetValue<FormData>;
}

const TaskRelatedItem = ({ watch, setValue }: TaskRelatedItemProps) => {
  const [relatedItems, setRelatedItems] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const type = watch("type");

  useEffect(() => {
    const fetchRelatedItems = async () => {
      setIsLoading(true);
      try {
        if (type === "opportunity") {
          const { data } = await mockOpportunitiesAPI.getOpportunities();
          if (data) {
            const items = data.map((opp) => ({
              id: opp.id,
              title: opp.title,
            }));
            setRelatedItems(items);
          }
        } else if (type === "proposal") {
          // For this example, we'll mock proposal data
          setRelatedItems([
            { id: "p1", title: "Software Proposal" },
            { id: "p2", title: "Hardware Proposal" },
            { id: "p3", title: "Consulting Proposal" },
          ]);
        } else {
          setRelatedItems([]);
        }
      } catch (error) {
        console.error("Error fetching related items:", error);
        setRelatedItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (type === "opportunity" || type === "proposal") {
      fetchRelatedItems();
    } else {
      setRelatedItems([]);
      setValue("related_item_id", undefined);
      setValue("related_item_title", undefined);
    }
  }, [type, setValue]);

  const handleRelatedItemChange = (id: string) => {
    setValue("related_item_id", id);
    const item = relatedItems.find((item) => item.id === id);
    if (item) {
      setValue("related_item_title", item.title);
    }
  };

  if (!["opportunity", "proposal"].includes(type)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="related_item">
          {type === "opportunity" ? "İlgili Fırsat" : "İlgili Teklif"}
        </Label>
        <Select
          onValueChange={handleRelatedItemChange}
          disabled={isLoading || relatedItems.length === 0}
        >
          <SelectTrigger id="related_item">
            <SelectValue placeholder={isLoading ? "Yükleniyor..." : "Seçiniz..."} />
          </SelectTrigger>
          <SelectContent>
            {relatedItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {watch("related_item_id") && (
        <div>
          <Input
            type="hidden"
            id="related_item_title"
            {...{ name: "related_item_title" }}
          />
        </div>
      )}
    </div>
  );
};

export default TaskRelatedItem;
