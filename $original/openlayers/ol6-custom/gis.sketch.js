$(document).ready(function() {
	const canvas = document.getElementById("jsCanvas");
	const ctx = canvas.getContext("2d");
	const colors = document.getElementsByClassName("jsColor");
	const range = document.getElementById("jsRange");
	const mode = document.getElementById("jsMode");
	const save = document.getElementById("jsSave");
	const erase = document.getElementById("jsErase");
	const palette = document.getElementById("palette");

	canvas.width = 800;
	canvas.height = 500;

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = "#2c2c2c"; // strokeStyle 은 예약어임.'
	ctx.fillStyle = "#2c2c2c";
	ctx.lineWidth = 5;

	background = "#00ff0000";

	let painting = false;
	let filling = false;

	stopPainting = function() {
		painting = false;
	};

	onMouseMove = function(e) {
		const x = e.offsetX;
		const y = e.offsetY;
		if (!painting) {
			ctx.beginPath();
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
			ctx.stroke();
		}
	};

	startPainting = function() {
		painting = true;
	};

	handleCanvasClick = function() {
		if (filling) {
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			background = ctx.fillStyle;
		}
	};

	handleCM = function(e) {
		e.preventDefault();
	};

	handleSaveClick = function() {
		const image = canvas.toDataURL();
		const link = document.createElement("a");
		link.href = image;
		link.download = "Paint";
		link.click();
	};

	if (canvas) {
		canvas.addEventListener("mousemove", onMouseMove);
		canvas.addEventListener("mousedown", startPainting);
		canvas.addEventListener("mouseup", stopPainting);
		canvas.addEventListener("mouseleave", stopPainting);
		canvas.addEventListener("click", handleCanvasClick);
		canvas.addEventListener("contextmenu", handleCM);
	}

	changeColor = function(e) {
		const color = e.target.style.backgroundColor;
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
	};

	handleRangeChange = function(e) {
		const brushWidth = e.target.value;
		ctx.lineWidth = brushWidth;
	};

	Array.from(colors).forEach(color =>
		color.addEventListener("click", changeColor)
	);

	if (range) {
		range.addEventListener("input", handleRangeChange);
	}

	handleModeClick = e => {
		/*
		 * if (filling) { filling = false; mode.innerText = "Fill"; } else { filling = true; mode.innerText = "Paint"; }
		 */

		filling = false;
		mode.innerText = "Fill";
	};

	handleEraseClick = e => {
		ctx.clearRect(0, 0, 800, 600);
		let mapImg = new Image();
		mapImg.src = $("#sketch", opener.document).prop('src');
		ctx.drawImage(mapImg, 0, 0, 800, 500);
	};

	changeColorByPalette = e => {
		const color = e.target.value;
		ctx.strokeStyle = "#" + color;
		ctx.fillStyle = "#" + color;
	};

	if (mode) {
		mode.addEventListener("click", handleModeClick);
	}

	if (save) {
		save.addEventListener("click", handleSaveClick);
	}

	if (erase) {
		erase.addEventListener("click", handleEraseClick);
	}

	if (palette) {
		palette.addEventListener("blur", changeColorByPalette);
	}

	let mapImg = new Image();
	mapImg.src = $("#sketch", opener.document).prop('src');
	ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
});