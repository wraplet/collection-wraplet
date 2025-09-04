import userEvent, { UserEvent } from "@testing-library/user-event";

export async function getIndirectException(
  action: (user: UserEvent) => Promise<void>,
) {
  let errorThrown: Error | undefined;

  // Listen for unhandled promise rejections or errors
  const errorHandler = (event: ErrorEvent) => {
    errorThrown = new Error(event.message);
    event.preventDefault();
  };

  window.addEventListener("error", errorHandler);

  const user = userEvent.setup();
  await action(user);
  window.removeEventListener("error", errorHandler);

  return errorThrown;
}
