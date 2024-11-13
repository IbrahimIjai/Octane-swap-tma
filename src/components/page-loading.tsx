import React from "react";
import OctaneSwapLogo from "./logo";

function PageLoadingUi() {
	return (
		<div className="h-screen w-screen flex items-center justify-center">
			<OctaneSwapLogo size={128} animated={true} />
		</div>
	);
}

export default PageLoadingUi;
