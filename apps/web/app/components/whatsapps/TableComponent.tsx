import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { WhatsApp } from "../../types";

export default function TableComponent({
  columns,
  rows,
  closeFunction,
}: {
  columns: String[];
  rows: WhatsApp[];
  closeFunction: Function;
}) {
  return (
    <Table aria-label="Example empty table">
      <TableHeader>
        {columns.map((c, index) => (
          <TableColumn key={index}>{c}</TableColumn>
        ))}
      </TableHeader>
      <TableBody emptyContent={"No rows to display."}>
        {rows.map((r, index) => (
          <TableRow key={index}>
            <TableCell>{r.name}</TableCell>
            <TableCell>
              <button onClick={() => closeFunction(r.name)}>
                Close Session
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
