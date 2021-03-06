import {
  Divider,
  makeStyles,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { KeyboardDatePicker } from "@material-ui/pickers";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import ResponsiveTable from "~components/table/ResponsiveTable";
import { firestore } from "~config/firebase";
import { maybe } from "~utils";
import { useOpen } from "~utils/hooks";
import PaymentsDetails from "./PaymentsDetails";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  datePicker: {
    margin: theme.spacing(0, 2),
  },
}));

const ShoppingList = () => {
  const [date, setDate] = useState(null);
  const classes = useStyles();
  const [receipt, setReceipt] = useState(null);
  const { isOpen, onOpen, onClose } = useOpen();

  const startDate = useMemo(() => (date ? new Date(new Date(date).setHours(0, 0, 0, 0)) : null), [
    date,
  ]);
  const endDate = useMemo(() => (date ? new Date(new Date(date).setHours(24, 0, 0, 0)) : null), [
    date,
  ]);

  const listRawRef = firestore.collection("payments");
  const listRef =
    startDate || endDate
      ? listRawRef.where("date", ">=", startDate).where("date", "<", endDate)
      : listRawRef;
  const limitListRef = listRef.limit(50);
  const [paymentsRaw] = useCollectionData(limitListRef, { idField: "id" });
  const payments = maybe(() => paymentsRaw, []);

  return (
    <>
      <div className={classes.datePicker}>
        <KeyboardDatePicker
          disableFuture
          margin="normal"
          id="date-picker-dialog"
          label="Choose Date"
          format="DD/MM/YYYY"
          placeholder="ex: DD/MM/YYYY"
          clearable
          value={date}
          onChange={setDate}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
        />
      </div>
      <Divider />
      <TableContainer>
        <ResponsiveTable>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((item) => {
              return (
                <TableRow
                  key={item.id}
                  hover
                  onClick={() => {
                    setReceipt(item.receipt);
                    onOpen();
                  }}
                >
                  <TableCell>{dayjs(item.date.toDate()).format("DD-MM-YYYY")}</TableCell>
                  <TableCell>Rp. {item.total.toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </ResponsiveTable>
      </TableContainer>
      <PaymentsDetails receipt={receipt} isOpen={isOpen} onClose={onClose} />
    </>
  );
};

export default ShoppingList;
