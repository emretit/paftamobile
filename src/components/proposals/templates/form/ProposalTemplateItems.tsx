
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { ProposalItem } from "@/types/proposal-form";
import ProposalItems from "@/components/proposals/form/ProposalItems";

interface ProposalTemplateItemsProps {
  items: ProposalItem[];
  setItems: React.Dispatch<React.SetStateAction<ProposalItem[]>>;
}

const ProposalTemplateItems: React.FC<ProposalTemplateItemsProps> = ({
  items,
  setItems,
}) => {
  const addItem = () => {
    const newItem: ProposalItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 18,
      totalPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: number | string) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice" || field === "taxRate") {
          const quantity = field === "quantity" ? Number(value) : item.quantity;
          const unitPrice = field === "unitPrice" ? Number(value) : item.unitPrice;
          const taxRate = field === "taxRate" ? Number(value) : item.taxRate;
          updatedItem.totalPrice = quantity * unitPrice * (1 + taxRate / 100);
        }
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  return (
    <div className="space-y-4">
      <ProposalItems
        items={items}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onUpdateItem={updateItem}
      />
    </div>
  );
};

export default ProposalTemplateItems;
