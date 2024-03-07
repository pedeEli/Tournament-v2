import {useRouter} from '@/components/Router'

const Tutorial = () => {
  const router = useRouter()

  console.log(router.route)

  return <div>
    {router.route.searchParams.get('step')}
  </div>
}

export default Tutorial