import { ChevronsLeft, ChevronsRight } from 'lucide-react';

import { SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';

type SidebarHeaderProps = {
	isExpanded: boolean
}

export function Header({
	isExpanded
}: SidebarHeaderProps) {
	return (
		<SidebarHeader className="flex flex-row group-data-[state=collapsed]:justify-center group-data-[state=expanded]:justify-between items-center bg-blue-600 py-4 w-full h-20 text-white">
			<span className="group-data-[state=collapsed]:hidden group-data-[state=expanded]:inline font-semibold text-lg truncate"
			>
				Conversation History
			</span>
			<SidebarTrigger className="hidden md:flex justify-center">
				{
					isExpanded
						? <ChevronsLeft />
						: <ChevronsRight />
				}
			</SidebarTrigger>
		</SidebarHeader>
	)
}