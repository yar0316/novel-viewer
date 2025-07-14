/**
 * SearchBoxコンポーネントのテスト
 * TDD Red Phase: 失敗するテストを先に作成
 */
import { render, screen, fireEvent } from '@/lib/test-utils'
import { SearchBox } from './SearchBox'

describe('SearchBox', () => {
  test('検索ボックスが表示される', () => {
    render(<SearchBox onSearch={jest.fn()} />)
    
    expect(screen.getByPlaceholderText('小説を検索...')).toBeInTheDocument()
  })

  test('検索ボタンがクリック可能', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBox onSearch={mockOnSearch} />)
    
    const searchButton = screen.getByRole('button', { name: /検索/i })
    expect(searchButton).toBeInTheDocument()
  })

  test('テキスト入力時に値が更新される', () => {
    render(<SearchBox onSearch={jest.fn()} />)
    
    const input = screen.getByPlaceholderText('小説を検索...')
    fireEvent.change(input, { target: { value: 'テスト検索' } })
    
    expect(input).toHaveValue('テスト検索')
  })

  test('検索ボタンクリック時にonSearchが呼ばれる', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBox onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('小説を検索...')
    const searchButton = screen.getByRole('button', { name: /検索/i })
    
    fireEvent.change(input, { target: { value: 'テスト検索' } })
    fireEvent.click(searchButton)
    
    expect(mockOnSearch).toHaveBeenCalledWith('テスト検索')
  })

  test('Enterキー押下時にonSearchが呼ばれる', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBox onSearch={mockOnSearch} />)
    
    const input = screen.getByPlaceholderText('小説を検索...')
    
    fireEvent.change(input, { target: { value: 'テスト検索' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    
    expect(mockOnSearch).toHaveBeenCalledWith('テスト検索')
  })

  test('初期値が設定されている場合、その値が表示される', () => {
    const initialValue = '初期検索語'
    render(<SearchBox onSearch={jest.fn()} initialValue={initialValue} />)
    
    const input = screen.getByPlaceholderText('小説を検索...')
    expect(input).toHaveValue(initialValue)
  })

  test('クリアボタンで検索語をクリアできる', () => {
    render(<SearchBox onSearch={jest.fn()} />)
    
    const input = screen.getByPlaceholderText('小説を検索...')
    fireEvent.change(input, { target: { value: 'テスト検索' } })
    
    const clearButton = screen.getByRole('button', { name: /クリア/i })
    fireEvent.click(clearButton)
    
    expect(input).toHaveValue('')
  })

  test('空の検索語では検索が実行されない', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBox onSearch={mockOnSearch} />)
    
    const searchButton = screen.getByRole('button', { name: /検索/i })
    fireEvent.click(searchButton)
    
    expect(mockOnSearch).not.toHaveBeenCalled()
  })
})