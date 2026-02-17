import Link from 'next/link'
import { HelpCircleIcon, MenuIcon } from '@/components/public/icons'
import { Button } from '@/components/ui/button'

interface Props {
    onMenuClick: () => void
    storeName: string
}

export function MobileHeader({ onMenuClick, storeName }: Props) {
    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-primary-500 text-white flex items-center justify-between px-4 z-[45] border-b border-white/10">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    data-tour="sidebar-trigger"
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors active:scale-95"
                    aria-label="Abrir menú"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-sm">ST</span>
                    </div>
                    <span className="font-bold text-sm truncate max-w-[150px]">{storeName}</span>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Link
                    href="/guia"
                    data-tour="help-button"
                    className="flex items-center justify-center w-10 h-10 text-white hover:bg-white/10 rounded-xl transition-colors"
                    title="Ver Guía de Uso"
                >
                    <HelpCircleIcon className="w-5 h-5" />
                </Link>
            </div>
        </header>
    )
}
