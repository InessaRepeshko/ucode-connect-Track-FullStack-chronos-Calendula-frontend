import { Popover, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface EventDetailsPopoverProps {
    position: { x: number; y: number };
    event: {
        id: string;
        title: string;
        start: string;
        end: string;
        description?: string;
        category?: string;
        type?: string;
        creationByUserId: number;
    };
    onEdit: () => void;
    onDelete: () => void;
    onClose: () => void;
    currentUserId?: number;
}

export default function EventDetailsPopover({
                                                position,
                                                event,
                                                onEdit,
                                                onDelete,
                                                onClose,
                                                currentUserId,
                                            }: EventDetailsPopoverProps) {
    const startDateTime = new Date(event.start);
    const endDateTime = new Date(event.end);
    const isCreator = currentUserId === event.creationByUserId;

    return (
        <Popover open={true} onOpenChange={(open) => !open && onClose()}>
            <PopoverContent
                className="w-[300px] h-auto p-4 space-y-4 bg-white border rounded-lg shadow-lg"
                style={{ position: "absolute", top: position.y, left: position.x }}
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    {isCreator && ( // Условный рендеринг кнопок
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={onEdit}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onDelete}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                    <p>
                        <strong>When:</strong>{" "}
                        {format(startDateTime, "PPP HH:mm")} - {format(endDateTime, "HH:mm")}
                    </p>
                    {event.description && (
                        <p>
                            <strong>Description:</strong> {event.description}
                        </p>
                    )}
                    {event.category && (
                        <p>
                            <strong>Category:</strong> {event.category}
                        </p>
                    )}
                    {event.type && (
                        <p>
                            <strong>Type:</strong> {event.type}
                        </p>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}