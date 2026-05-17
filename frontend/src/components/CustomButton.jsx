import { Button } from "@mui/material";

const CustomButton = ({ children, ...props }) => (
  <Button variant="contained" disableElevation {...props}>
    {children}
  </Button>
);

export default CustomButton;

