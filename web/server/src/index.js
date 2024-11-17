import { app } from "./app.js";

const Port = 3000;

app.listen(Port, () => {
  console.log(`server is listening at port ${Port}`);
});
