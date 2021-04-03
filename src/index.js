import { registerBlockType } from "@wordpress/blocks";
import edit from "./edit";

registerBlockType("rn/news-block", {
	apiVersion: 2,
	edit,
	save: () => null,
});
