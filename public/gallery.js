document.addEventListener("DOMContentLoaded", function () {
	const gallery = document.getElementById("gallery");
	const filters = document.getElementById("filters");
	let fullData = []; // Store the full data set
	let lastFilterResult = []; // Store the last filtering results for display purposes only

	fetch("metadata.json")
		.then((response) => response.json())
		.then((data) => {
			fullData = data; // Initialize the full data cache

			const attributeCategories = {
				alignment: new Set(),
				background: new Set(),
				back: new Set(),
				body: new Set(),
				armor: new Set(),
				hair: new Set(),
				mask: new Set(),
				under: new Set(),
			};

			// Gather unique values for each attribute type
			data.forEach((item) => {
				item.meta.attributes.forEach((attr) => {
					if (attributeCategories.hasOwnProperty(attr.trait_type)) {
						attributeCategories[attr.trait_type].add(attr.value);
					}
				});
			});

			// Generate checkboxes for each attribute category
			Object.keys(attributeCategories).forEach((type) => {
				const container = document.createElement("div");
				container.innerHTML = `<strong>${
					type.charAt(0).toUpperCase() + type.slice(1)
				}</strong>`;
				attributeCategories[type].forEach((value) => {
					const checkbox = document.createElement("input");
					checkbox.type = "checkbox";
					checkbox.value = value;
					checkbox.id = `${type}-${value}`;
					checkbox.name = type;
					checkbox.onchange = updateGallery;
					const label = document.createElement("label");
					label.htmlFor = `${type}-${value}`;
					label.textContent = value;
					container.appendChild(checkbox);
					container.appendChild(label);
				});
				filters.appendChild(container);
			});

			updateGallery(); // Initial display of gallery

			function updateGallery() {
				gallery.innerHTML = "";
				lastFilterResult = fullData
					.filter((item) => {
						const hasUnknownLostPilgrim = item.meta.attributes.some(
							(attr) =>
								attr.trait_type === "lost pilgrim" && attr.value === "Unknown"
						);
						return !hasUnknownLostPilgrim; // Filter out "lost pilgrim" if "Unknown"
					})
					.filter((item) => {
						let display = true;
						Object.keys(attributeCategories).forEach((type) => {
							const checkedBoxes = Array.from(
								document.querySelectorAll(`input[name="${type}"]:checked`)
							).map((el) => el.value);
							if (checkedBoxes.length > 0) {
								const attributeValues = item.meta.attributes
									.filter((attr) => attr.trait_type === type)
									.map((attr) => attr.value);
								display =
									display &&
									checkedBoxes.some((value) => attributeValues.includes(value));
							}
						});
						return display;
					});

				lastFilterResult.forEach((item) => {
					const div = document.createElement("div");
					div.className = "token";
					const imageUrl = `https://renderer.magiceden.dev/v2/render?id=${item.id}`;
					div.innerHTML = `<img src="${imageUrl}" alt="Token Image">`;

					const attributesContainer = document.createElement("div");
					attributesContainer.className = "attributes";
					attributesContainer.innerHTML = `<p>ID: ${item.id}</p>`;
					item.meta.attributes.forEach((attr) => {
						attributesContainer.innerHTML += `<p>${attr.trait_type}: ${attr.value}</p>`;
					});

					div.appendChild(attributesContainer);
					gallery.appendChild(div);
				});
			}
		});
});
