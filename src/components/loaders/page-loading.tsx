import React from "react";
import OctaneSwapLogo from "../logo";
import { motion } from "framer-motion";

function PageLoadingUi() {
	return (
		<div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
			<div className="flex flex-col items-center">
				<OctaneSwapLogo size={128} animated={true} />
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.8 }}
					className="mt-4 text-2xl font-bold text-primary">
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.8, duration: 0.5 }}>
						O
					</motion.span>
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.9, duration: 0.5 }}>
						c
					</motion.span>
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.0, duration: 0.5 }}>
						t
					</motion.span>
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.1, duration: 0.5 }}>
						a
					</motion.span>
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.2, duration: 0.5 }}>
						n
					</motion.span>
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.3, duration: 0.5 }}>
						e
					</motion.span>
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.4, duration: 0.5 }}>
						{" "}
					</motion.span>
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.5, duration: 0.5 }}>
						S
					</motion.span>
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.6, duration: 0.5 }}>
						w
					</motion.span>
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.7, duration: 0.5 }}>
						a
					</motion.span>
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.8, duration: 0.5 }}>
						p
					</motion.span>
				</motion.div>
			</div>
		</div>
	);
}

export default PageLoadingUi;
