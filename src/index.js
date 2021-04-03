import { registerBlockType } from "@wordpress/blocks";
import edit from "./edit";

registerBlockType("rn/news-block", {
	apiVersion: 2,
	edit,
	save: () => null,
	attributes: {
		topic: {
			type: "string",
			default: "",
		},
		perPage: {
			type: "number",
			default: 10,
		},
		page: {
			type: "number",
			default: 1,
		},
	},
});
