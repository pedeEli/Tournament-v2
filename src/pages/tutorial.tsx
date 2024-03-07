import {useRouter} from '@/components/Router'
import Layout from '@/pages/_layout'
import Contestants from '@/pages/contestants'

const Tutorial = () => {
  const router = useRouter()

  const step = parseInt(router.route.searchParams.get('step') ?? '-1')
  console.log(step)
  if (isNaN(step) || step < 0) {
    router.goto('/tutorial?step=0')
    return <div>Ungültiger Schritt: {step}</div>
  }


  return <div>
    <Layout>
      <Contestants/>
    </Layout>
  </div>
}

export default Tutorial