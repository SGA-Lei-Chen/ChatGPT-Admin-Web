import useSWR, {
  mutate,
  type Key,
  type SWRConfiguration,
  type SWRResponse,
} from "swr";
import useSWRMutation, {
  type SWRMutationConfiguration,
  type SWRMutationResponse,
} from "swr/mutation";
import type {
  ClientMethod,
  ClientRequestOptions,
  InferRequestType,
  InferResponseType,
} from "hono/client";

// Utility function to generate SWR key
function generateSWRKey<TMethod extends ClientMethod<any, any>>(
  method: TMethod,
  args?: InferRequestType<TMethod>
): Key {
  const path = method.__path;
  const httpMethod = method.__method;
  return [`hc:${httpMethod}:${path}`, args];
}

// useHC Hook for GET requests (SWR)
export function useHC<TMethod extends ClientMethod<any, any>>(
  method: TMethod,
  ...params: InferRequestType<TMethod> extends never
    ? [
        args?: InferRequestType<TMethod>,
        options?: SWRConfiguration<InferResponseType<TMethod>> &
          ClientRequestOptions
      ]
    : [
        args: InferRequestType<TMethod>,
        options?: SWRConfiguration<InferResponseType<TMethod>> &
          ClientRequestOptions
      ]
): SWRResponse<InferResponseType<TMethod>, Error> {
  const [args, options = {}] = params;

  // 分离 SWR 配置和客户端配置
  const {
    fetch: _fetch,
    webSocket,
    init,
    headers,
    // SWR 的所有配置选项
    revalidateOnFocus,
    revalidateOnMount,
    revalidateOnReconnect,
    refreshInterval,
    refreshWhenOffline,
    refreshWhenHidden,
    dedupingInterval,
    focusThrottleInterval,
    loadingTimeout,
    errorRetryInterval,
    errorRetryCount,
    fallback,
    fallbackData,
    keepPreviousData,
    suspense,
    compare,
    isPaused,
    use,
    onSuccess,
    onError,
    onErrorRetry,
    onLoadingSlow,
    shouldRetryOnError,
    ...restOptions
  } = options;

  const clientOptions: ClientRequestOptions = {
    fetch: _fetch,
    webSocket,
    init,
    headers,
  };

  const swrOptions = {
    revalidateOnFocus,
    revalidateOnMount,
    revalidateOnReconnect,
    refreshInterval,
    refreshWhenOffline,
    refreshWhenHidden,
    dedupingInterval,
    focusThrottleInterval,
    loadingTimeout,
    errorRetryInterval,
    errorRetryCount,
    fallback,
    fallbackData,
    keepPreviousData,
    suspense,
    compare,
    isPaused,
    use,
    onSuccess,
    onError,
    onErrorRetry,
    onLoadingSlow,
    shouldRetryOnError,
    ...restOptions,
  };

  const swrKey = generateSWRKey(method, args);

  return useSWR(
    swrKey,
    async () => {
      try {
        const response = await method(args, clientOptions);

        if (!response.ok) {
          const error = new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
          (error as any).status = response.status;
          (error as any).response = response;
          throw error;
        }

        // 根据响应的 Content-Type 自动解析
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          return await response.json();
        }
        if (contentType.includes("text/")) {
          return await response.text();
        }
        // 对于其他类型，尝试 json，失败则返回 text
        try {
          return await response.json();
        } catch {
          return await response.text();
        }
      } catch (error) {
        console.error("useHC fetch error:", error);
        throw error;
      }
    },
    swrOptions
  );
}

// useHCMutation Hook for POST requests (SWR Mutation)
export function useHCMutation<TMethod extends ClientMethod<any, any>>(
  method: TMethod,
  options?: SWRMutationConfiguration<
    InferResponseType<TMethod>,
    Error,
    string,
    InferRequestType<TMethod>
  > &
    ClientRequestOptions
): SWRMutationResponse<
  InferResponseType<TMethod>,
  Error,
  string,
  InferRequestType<TMethod>
> {
  const {
    fetch: _fetch,
    webSocket,
    init,
    headers,
    ...swrOptions
  } = options || {};

  const clientOptions: ClientRequestOptions = {
    fetch: _fetch,
    webSocket,
    init,
    headers,
  };

  const swrKey = generateSWRKey(method);

  return useSWRMutation(
    swrKey,
    async (key: Key, { arg }: { arg: InferRequestType<TMethod> }) => {
      try {
        const response = await method(arg, clientOptions);

        if (!response.ok) {
          const error = new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
          (error as any).status = response.status;
          (error as any).response = response;
          throw error;
        }

        // 根据响应的 Content-Type 自动解析
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          return await response.json();
        }
        if (contentType.includes("text/")) {
          return await response.text();
        }

        try {
          return await response.json();
        } catch {
          return await response.text();
        }
      } catch (error) {
        console.error("useHCMutation error:", error);
        throw error;
      }
    },
    swrOptions
  );
}

// // 扩展Hook：获取原始响应对象
// export function useHCRaw<TMethod extends HonoClientMethod>(
//   method: TMethod,
//   ...params: InferRequestType<TMethod> extends never
//     ? [
//         args?: InferRequestType<TMethod>,
//         options?: SWRConfiguration<ClientResponseOfEndpoint<any>> &
//           ClientRequestOptions
//       ]
//     : [
//         args: InferRequestType<TMethod>,
//         options?: SWRConfiguration<ClientResponseOfEndpoint<any>> &
//           ClientRequestOptions
//       ]
// ): SWRResponse<ClientResponseOfEndpoint<any>, Error> {
//   const [args, options = {}] = params;

//   const { fetch: _fetch, webSocket, init, headers, ...swrOptions } = options;

//   const clientOptions: ClientRequestOptions = {
//     fetch: _fetch,
//     webSocket,
//     init,
//     headers,
//   };

//   const swrKey = generateSWRKey(method, args) + ":raw";

//   return useSWR(
//     swrKey,
//     async () => {
//       return await method(args, clientOptions);
//     },
//     swrOptions
//   );
// }

// 工具函数：手动触发重新验证
export function mutateHC<TMethod extends ClientMethod<any, any>>(
  method: TMethod,
  args?: InferRequestType<TMethod>
) {
  const key = generateSWRKey(method, args);
  return mutate(key);
}

// 工具类型：检查方法是否需要参数
export type RequiresArgs<TMethod> = InferRequestType<TMethod> extends never
  ? false
  : true;

export type UseHCOptions<TMethod extends ClientMethod<any, any>> =
  SWRConfiguration<InferResponseType<TMethod>> & ClientRequestOptions;

export type UseHCMutationOptions<TMethod extends ClientMethod<any, any>> =
  SWRMutationConfiguration<
    InferResponseType<TMethod>,
    Error,
    string,
    InferRequestType<TMethod>
  > &
    ClientRequestOptions;
