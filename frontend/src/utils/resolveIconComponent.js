const resolveIconComponent = (iconModule) => {
  let resolved = iconModule;

  for (let depth = 0; depth < 4; depth += 1) {
    if (!resolved || typeof resolved !== "object") {
      break;
    }

    if (resolved.$$typeof) {
      break;
    }

    if (!("default" in resolved)) {
      break;
    }

    resolved = resolved.default;
  }

  return resolved;
};

export default resolveIconComponent;
