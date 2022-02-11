// import { ApolloClient, InMemoryCache, createHttpLink /*, createHttpLink */ } from '@apollo/client/core'
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import { boot } from 'quasar/wrappers'
// import { getClientOptions } from 'src/apollo'

export default boot(
  /* async */ ({ app }) => {
    const httpLink = createHttpLink({
      uri: '/graphql'
    })

    const apolloClient = new ApolloClient({
      link: httpLink,
      cache: new InMemoryCache()
    })

    // Default client.
    // const options = /* await */ getClientOptions(/* {app, router ...} */)
    // const apolloClient = new ApolloClient(options)
    // console.log(options)

    const apolloClients: Record<string, ApolloClient<unknown>> = {
      default: apolloClient
      // clientA,
      // clientB,
    }

    app.provide(ApolloClients, apolloClients)
  }
)
