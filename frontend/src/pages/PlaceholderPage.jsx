import ManagementPlaceholder from "../components/ManagementPlaceholder";

const subtitleByTitle = {
  Categories: "Foundational taxonomy setup for corporate gifting structure.",
  "Sub-Categories": "Secondary catalog hierarchy and structured grouping module.",
  Items: "Item master management space with media, metadata, and workflows.",
  "User Management": "Access control, role permissions, and account lifecycle management.",
};

const PlaceholderPage = ({ title }) => (
  <ManagementPlaceholder title={title} subtitle={subtitleByTitle[title] || "Module placeholder"} />
);

export default PlaceholderPage;
