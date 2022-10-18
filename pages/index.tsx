import type { NextPage } from 'next'
import Image from 'next/image'
import { Fragment, useState } from 'react'
import { apiClient } from '../apiClient'
import { IoChevronForward } from 'react-icons/io5'
import Layout from '../components/Layout'
import { formatDate } from '../utils/helpers/formateDate'
import { useInfiniteQuery } from '@tanstack/react-query'

interface ToolsData {
    tools: Tool[]
    info: {
        count: number
        pages: number
        next: string
        prev: string
    }
}

interface Props {
    data: {
        toolsData: ToolsData
        tags: string[]
    }
}

const Home: NextPage<Props> = (props) => {
    // const openGoogle = () => {
    //     window.open(
    //         `${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/github`,
    //         '_self',
    //     )
    // }

    const [selected, setSelected] = useState('All')

    const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
        ['tools', selected],
        ({ pageParam = 1 }) =>
            apiClient
                .get<ToolsData>('/tools', {
                    params: {
                        tag: selected === 'All' ? '' : selected,
                        page: pageParam,
                        limit: 9,
                    },
                })
                .then((res) => res.data),
        {
            getNextPageParam: (lastPage) => lastPage.info.next ?? undefined,
            initialData: {
                pages: [props.data.toolsData],
                pageParams: [1],
            },
        },
    )

    const [searchTerm, setSearchTerm] = useState('')
    const selectedButtonClasses = 'border-b-2 border-b-primary-main'

    console.log(searchTerm)

    return (
        <Layout
            title="Web Tools"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
        >
            <div className="text-[2.5rem] sm:text-6xl mt-12 sm:mt-28 mb-6 sm:mb-16">
                <h1 className="font-bold capitalize text-secondary-main">
                    {selected} Tools
                </h1>
            </div>
            <div className="flex h-12 max-w-full overflow-x-scroll tags">
                {['All', ...props.data.tags].map((tag) => (
                    <button
                        key={tag}
                        className={`transition-all mx-3 min-w-fit text-lg text-neutral-dark hover:border-b-primary-main hover:border-b-2 capitalize ${
                            selected === tag ? selectedButtonClasses : ''
                        }`}
                        onClick={() => {
                            setSelected(tag)
                        }}
                    >
                        {tag}
                    </button>
                ))}
            </div>
            <div className="grid row-span-5 gap-8 pb-8 mt-8 sm:grid-cols-2 lg:grid-cols-3 sm:mt-14">
                {data?.pages.map((page) => (
                    <Fragment key={page.info.next}>
                        {page.tools.map((tool, i) => (
                            <div
                                key={tool.slug}
                                className="w-full overflow-hidden bg-white rounded-2xl md:w-full shadow-cart"
                                style={{
                                    WebkitBackfaceVisibility: 'hidden',
                                    MozBackfaceVisibility: 'hidden',
                                    WebkitTransform: 'translate3d(0, 0, 0)',
                                    // @ts-ignore - this is a valid property
                                    MozTransform: 'translate3d(0, 0, 0)',
                                }}
                            >
                                <div className="relative h-[192px]">
                                    <Image
                                        loader={({ src }) => src}
                                        src={`https://picsum.photos/400/300?random=${i}`}
                                        alt={tool.name}
                                        className="transition duration-300 hover:scale-125"
                                        layout="fill"
                                        unoptimized
                                        priority
                                    />
                                </div>
                                <div className="px-6">
                                    <p className="text-secondary-main mt-4 mb-6 opacity-[.4]">
                                        {formatDate(tool.createdAt)}
                                    </p>
                                    <h2 className="mb-6 text-2xl font-semibold capitalize transition-colors">
                                        {tool.name}
                                    </h2>
                                    <p className="min-h-[70px] max-h-[70px] text-secondary-main text-ellipsis overflow-hidden whitespace-pre-wrap mb-4">
                                        {tool.description}
                                    </p>
                                    <a
                                        href={tool.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center mb-6 max-w-fit btn-primary"
                                    >
                                        Learn more
                                        <IoChevronForward
                                            size={18}
                                            className="ml-2"
                                        />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </Fragment>
                ))}
            </div>
            {hasNextPage && (
                <button
                    onClick={() => fetchNextPage()}
                    className="mb-8 flex mx-auto btn-secondary"
                >
                    More
                </button>
            )}
        </Layout>
    )
}

export async function getStaticProps() {
    const [{ data: tags }, { data: toolsData }] = await Promise.all([
        apiClient.get<string[]>('/tags'),
        apiClient.get<Tool[]>('/tools'),
    ])

    return {
        props: {
            data: {
                tags,
                toolsData,
            },
        },
    }
}

export default Home
