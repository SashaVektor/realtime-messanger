"use client"
import Modal from '@/app/components/Modal'
import Image from 'next/image'
import { FC } from 'react'

interface ImageModalProps {
    src?: string | null
    isOpen?: boolean
    onClose: () => void
}

const ImageModal: FC<ImageModalProps> = ({ onClose, isOpen, src }) => {

    if (!src) return null

    return <Modal
        onClose={onClose}
        isOpen={isOpen}
    >
        <div className='w-80 h-80'>
            <Image
                alt="Image"
                className='object-cover'
                fill
                src={src}
            />
        </div>
    </Modal>
}

export default ImageModal