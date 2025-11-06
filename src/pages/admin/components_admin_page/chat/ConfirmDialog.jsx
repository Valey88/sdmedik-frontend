import React from "react";
import { Dialog, DialogTitle, DialogActions, Button } from "@mui/material";

export default function ConfirmDialog({
  open,
  title,
  onCancel,
  onConfirm,
  confirmColor = "error",
  confirmText = "Удалить",
}) {
  return (
    <Dialog open={!!open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogActions>
        <Button onClick={onCancel}>Отмена</Button>
        <Button onClick={onConfirm} color={confirmColor}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
